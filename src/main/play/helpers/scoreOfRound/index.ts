import _ from 'underscore';
import logger from '../../../logger';
import {
  getTableData,
  getRoundTableData,
  setRoundTableData,
  getPlayerGamePlay,
  setPlayerGamePlay,
  getRoundScoreHistory,
  setRoundScoreHistory,
  getTurnHistory,
  getUser,
  decrCounterLobbyWise,
  getOnliPlayerCountLobbyWise,
  removeOnliPlayerCountLobbyWise,
  setTableData,
} from '../../../gameTable/utils';
import CommonEventEmitter from '../../../commonEventEmitter';
import {
  EMPTY,
  EVENTS,
  EVENT_EMITTER,
  GAME_PREFIX,
  INSTRUMENTATION_EVENTS,
  NUMERICAL,
  REDIS,
  SNS_KEYS,
  TABLE_STATE,
} from '../../../../constants';
import {
  userDetailInScoreIf,
  userScoreIf,
  userScoreTotalIf,
} from '../../../interface/userScoreIf';
import Scheduler from '../../../scheduler';
import startNewRound from '../../startNewRound';
import {removeAllPlayingTableAndHistory} from '../../leaveTable/helpers/index';
import {playingTableIf} from '../../../interface/playingTableIf';
import {roundTableIf} from '../../../interface/roundTableIf';
import Validator from '../../../Validator';
import Errors from '../../../errors';
import {initialNewRoundStartTimerIf} from '../../../interface/schedulerIf';
import {formatWinnerDeclareIf} from '../../../interface/responseIf';
import {userScoreDataForGrpc} from '../../../interface/grpcIf';
import sendTOSns from '../../../utils/sendDataToSns';
import {updateBidHistory, updateWinnerId} from '../../history';
import {formatScoreData} from '../playHelper';
import setGameCounter from './setGameCounter';
import showScoreBoardWinningAmount from './showScoreBordWinningAmount';
import formatMultiPlayerScore from '../../../clientsideapi/helper/formatMultiPlayerSubmitScore';
import {
  markCompletedGameStatus,
  multiPlayerWinnScore,
} from '../../../clientsideapi';
import roundScoreHistory from '../../../PlayingTracking/helper';
import setCurrentRoundDatas from '../../../PlayingTracking/helper/setCurrentRoundData';
import getCurrentRoundCard from '../../../PlayingTracking/helper/getCurrentRoundCard';
import {userIf} from '../../../interface/userSignUpIf';
import {multiPlayerWinnScoreIf} from '../../../interface/cmgApiIf';
import {addLogsInS3Bucket} from '../../../services';
import {getConfig} from '../../../../config';
const {NODE_ENV} = getConfig();

// Declare a Score Of Current Round after Complete round
const scoreOfRound = async (tableId: string) => {
  const {
    getLock,
    getConfigData: {
      HAND_POINT,
      EXTRA_HAND_POINT,
      BONUS_POINT,
      EXTRA_HAND_LOGIC,
      BONUS_LOGIC,
      NEW_GAME_START_TIMER,
    },
  } = global;
  const key = `${NUMERICAL.TEN}: ${tableId}`;
  const scoreOfRoundLock = await getLock.acquire([key], 2000);
  try {
    const point: number = HAND_POINT;
    const bagsPoint: number = EXTRA_HAND_POINT;
    const bonusPoint: number = BONUS_POINT;
    const newGameStartTimer: number = NEW_GAME_START_TIMER;
    const playingTable: playingTableIf = await getTableData(tableId);
    const currentRound: number = playingTable.currentRound;
    const {winningScores, gameStartTimer, lobbyId, totalRounds} = playingTable;

    const roundPlayingTable: roundTableIf = await getRoundTableData(
      tableId,
      currentRound,
    );
    const {isFTUE} = playingTable;
    const {isTieRound, currentTieRound} = roundPlayingTable;

    // Get last Round Score History
    let roundScoreHistory = await getRoundScoreHistory(tableId);
    roundScoreHistory = roundScoreHistory || {history: []};

    const playerSeats = roundPlayingTable.seats;
    const playersPlayingData = await Promise.all(
      Object.keys(playerSeats).map(async ele =>
        getPlayerGamePlay(playerSeats[ele].userId, tableId),
      ),
    );
    const userScore: userScoreIf[] = [];
    // const userDetailInScore: userDetailInScoreIf[] = [];
    // const userScoreTotal: userScoreTotalIf[] = [];

    let isUserLeft: boolean = false;
    let isUserLeftCount: number = NUMERICAL.ZERO;
    const noOfPlayer: number = Number(roundPlayingTable.noOfPlayer);

    logger.info(tableId, `BONUS_LOGIC ::: ${BONUS_LOGIC}`);
    logger.info(tableId, `EXTRA_HAND_LOGIC ::: ${EXTRA_HAND_LOGIC}`);
    // Calculation Of Point, Hand, bags

    playersPlayingData.forEach(async player => {
      if (player.isLeft) {
        isUserLeftCount += NUMERICAL.ONE;
      }
      if (noOfPlayer == NUMERICAL.TWO && isUserLeftCount >= NUMERICAL.ONE) {
        isUserLeft = true;
      }
      if (noOfPlayer == NUMERICAL.FOUR && isUserLeftCount >= NUMERICAL.THREE) {
        isUserLeft = true;
      }
    });

    playersPlayingData.forEach(async player => {
      const score: any = {};
      const bid = player.bid;
      const hands = player.hands;
      score.username = player.username;
      score.profilePicture = player.profilePicture;
      score.userId = player.userId;
      score.seatIndex = player.seatIndex;
      score.bid = bid;
      score.hands = hands;
      score.isLeft = player.isLeft;
      score.isAuto = player.isAuto;

      logger.info(
        tableId,
        `username :: ${player.username} :: bid : ${bid} :: hands : ${hands}`,
      );
      const userPoint = Number(JSON.parse(JSON.stringify(player.point)));
      logger.info(tableId, 'userPoint :>> ', userPoint);
      // bonus logic :: user bid 8 or above and user collect 8 or above hand, user get the 13 point
      if (BONUS_LOGIC && NUMERICAL.EIGHT <= bid && NUMERICAL.EIGHT <= hands) {
        const roundPoint = bonusPoint;
        score.roundBags = NUMERICAL.ZERO;
        score.roundPoint = roundPoint;
        score.totalBags = player.bags;
        score.BagsPenalty = NUMERICAL.ZERO;
        const totalPoint = player.point + roundPoint;
        score.totalPoint = totalPoint;
        player.point = totalPoint;
      }
      // bid is NotEqual 0
      // bid is more than of hands
      else if (bid > hands) {
        const roundPoint = bid * -point;
        score.roundBags = NUMERICAL.ZERO;
        score.roundPoint = roundPoint;
        score.totalBags = player.bags;
        score.BagsPenalty = NUMERICAL.ZERO;
        const totalPoint = player.point + roundPoint;
        score.totalPoint = totalPoint;
        player.point = totalPoint;
      }
      // hands is more than of bid
      // if extra logic ( more than 3 hand extra then user score is - bid ) // change
      else if (bid < hands) {
        const bags = hands - bid;
        logger.info(tableId, `bid < hands :: ${bags}`);

        if (EXTRA_HAND_LOGIC && bags > NUMERICAL.THREE) {
          const BagsPenalty = NUMERICAL.ZERO;
          // player.bags += bags;
          const totalBags = player.bags;
          const roundPoint = bid * -point;
          // roundPoint += bags * bagsPoint;
          score.roundBags = 0;
          score.roundPoint = roundPoint;
          score.totalBags = totalBags;
          // if (totalBags >= NUMERICAL.TEN) {
          //   // roundPoint -= NUMERICAL.HUNDRED;
          //   BagsPenalty -= NUMERICAL.HUNDRED;
          //   player.bags -= NUMERICAL.TEN;
          // }
          score.BagsPenalty = BagsPenalty;
          const totalPoint = player.point + roundPoint;
          score.totalPoint = totalPoint;
          player.point = totalPoint;
        } else {
          const BagsPenalty = NUMERICAL.ZERO;
          // player.bags += bags;

          logger.info(tableId, `bid < hands :point: ${point}`);
          logger.info(tableId, `bid < hands :bagsPoint: ${bagsPoint}`);
          let roundPoint = bid * point;
          logger.info(tableId, `bid < hands :roundPoint: ${roundPoint}`);
          logger.info(
            tableId,
            `bid < hands :bags * bagsPoint: ${bags * bagsPoint}`,
          );
          roundPoint += bags * bagsPoint;
          logger.info(tableId, `bid < hands :roundPoint1: ${roundPoint}`);
          score.roundBags = 0;
          score.roundPoint = roundPoint;
          score.totalBags = 0;
          // if (totalBags >= NUMERICAL.TEN) {
          //   // roundPoint -= NUMERICAL.HUNDRED;
          //   // BagsPenalty -= NUMERICAL.HUNDRED;
          //   player.bags -= NUMERICAL.TEN;
          // }
          score.BagsPenalty = BagsPenalty;
          const totalPoint = player.point + roundPoint;
          score.totalPoint = totalPoint;
          player.point = totalPoint;
        }
      }
      // bid is equal of hands
      else if (bid === hands) {
        const roundPoint = hands * point;
        score.roundBags = NUMERICAL.ZERO;
        score.roundPoint = roundPoint;
        score.totalBags = player.bags;
        score.BagsPenalty = NUMERICAL.ZERO;
        const totalPoint = player.point + roundPoint;
        score.totalPoint = totalPoint;
        player.point = totalPoint;
      }

      logger.info(
        tableId,
        'isUserLeft :>',
        isUserLeft,
        'player.point :>',
        player.point,
        'userPoint ::>',
        userPoint,
      );
      if (isUserLeft) {
        score.totalPoint = userPoint;
      }

      userScore.push(score);
      // userDetailInScore.push({
      //   username: score.username,
      //   profilePicture: score.profilePicture,
      //   seatIndex: score.seatIndex,
      // });
      // userScoreTotal.push({
      //   seatIndex: score.seatIndex,
      //   totalPoint: score.totalPoint,
      // });
      await setPlayerGamePlay(player.userId, tableId, player);
    });
    logger.info(tableId, 'scoreOfRound : userScore :: ', userScore);
    // logger.info('scoreOfRound : userDetailInScore :: ', userDetailInScore);
    // logger.info('scoreOfRound : userScoreTotal :: ', userScoreTotal);

    // updated score and bid history
    await updateBidHistory(tableId, currentRound, userScore);
    let winner: number[] = [];

    logger.info(
      tableId,
      'isUserLeft : ',
      isUserLeft,
      'totalRounds : ',
      totalRounds,
      'currentRound : ',
      currentRound,
    );
    if (totalRounds <= currentRound) {
      // declear winner
      winner = await checkWinner(userScore, winningScores, isUserLeft, tableId);
      // winner = [1];
    } else {
      // start new Round
      if (isUserLeft) {
        winner = await checkWinner(
          userScore,
          winningScores,
          isUserLeft,
          tableId,
        );
      }
    }
    logger.info(tableId, 'scoreOfRound : winner :: ', winner);
    await updateWinnerId(tableId, currentRound, playersPlayingData, winner);

    // check Winner Of Round

    // }
    let title: string = '';
    if (isTieRound) {
      title = `${TABLE_STATE.TIE_ROUND_TITLE} ${currentTieRound}`;
    } else {
      title = `${TABLE_STATE.ROUND_TITLE} ${currentRound}`;
    }
    const currantRoundCard = await getCurrentRoundCard(userScore, tableId);
    logger.info(tableId, 'title  :: ', title);
    logger.info(tableId, 'currantRoundCard  :: ', currantRoundCard);
    const eventData = {
      title,
      currantRoundCard,
      roundScore: userScore,
    };
    logger.info(tableId, 'eventData :: ', eventData);
    logger.info(
      tableId,
      ' roundScoreHistory.history :::::::',
      roundScoreHistory.history,
      'roundPlayingTable.currentRound :: ',
      roundPlayingTable.currentRound,
      'roundScoreHistory.history.length :: ',
      roundScoreHistory.history.length,
    );
    logger.info(tableId, ' isUserLeft :: ', isUserLeft);

    // if(roundScoreHistory.history.s)
    if (roundScoreHistory.history.length != NUMERICAL.ZERO) {
      const lastHistoryIndex: number =
        roundScoreHistory.history.length - NUMERICAL.ONE;
      const findLastRoundNumber = Number(
        roundScoreHistory.history[lastHistoryIndex].title.charAt(
          title.length - 1,
        ),
      );
      logger.info(
        tableId,
        'lastHistoryIndex ::>>',
        lastHistoryIndex,
        ' findLastRoundNumber  ::>> ',
        findLastRoundNumber,
      );
      if (
        findLastRoundNumber != roundPlayingTable.currentRound &&
        isUserLeft === false
      ) {
        roundScoreHistory.history.push(eventData);
      }
    } else {
      roundScoreHistory.history.push(eventData);
    }
    await setRoundScoreHistory(tableId, roundScoreHistory);

    roundPlayingTable.tableCurrentTimer = Number(new Date());
    roundPlayingTable.tableState = TABLE_STATE.SCOREBOARD_DECLARED;

    const roundScore = await formatScoreData(
      userScore,
      roundScoreHistory.history,
    );

    logger.info(tableId, 'winner :>> ', winner);

    let nextRound: number = currentRound;
    if (winner.length !== NUMERICAL.ONE) {
      nextRound += 1;
      roundPlayingTable.currentRound = nextRound;
    }
    logger.info(tableId, ' roundPlayingTable :: >>> ', roundPlayingTable);
    await setRoundTableData(tableId, currentRound, roundPlayingTable);
    playingTable.winner = winner;
    await setTableData(playingTable);

    let winningAmount: any = [];
    let startTimer: number = NUMERICAL.FIVE;
    if (winner.length == NUMERICAL.ONE) {
      winningAmount = await showScoreBoardWinningAmount(
        userScore,
        winner,
        tableId,
      );
      startTimer = newGameStartTimer;
    }
    logger.info(tableId, ' startTimer :: -->>> ', startTimer);

    let sendEventData: formatWinnerDeclareIf = {
      timer: Number(startTimer),
      winner,
      roundScoreHistory: roundScore,
      winningAmount: winningAmount,
      roundTableId: tableId,
      nextRound,
    };

    sendEventData =
      await Validator.responseValidator.formatWinnerDeclareValidator(
        sendEventData,
      );

    logger.info(
      tableId,
      `scoreOfRound :: score boarde data : ${JSON.stringify(sendEventData)}`,
    );

    if (winner.length == NUMERICAL.ONE) {
      const apiData = (await formatMultiPlayerScore(
        tableId,
        userScore,
        winner,
        isUserLeft,
      )) as multiPlayerWinnScoreIf;

      let token: string = EMPTY;
      for await (const score of userScore) {
        const getUserDetail: userIf | null = await getUser(score.userId);
        // console.log("scoreOfRound :: getUserDetail :>> ", getUserDetail);
        if (getUserDetail && getUserDetail.authToken) {
          token = getUserDetail.authToken;
        }
      }
      logger.info('scoreOfRound ::  token ::: ', token);

      // for multi player score submit api
      await multiPlayerWinnScore(apiData, token, EMPTY);

      // decrment counter for lobby wise player online
      for await (const e of userScore) {
        if (e.isLeft === false) {
          await decrCounterLobbyWise(
            REDIS.ONLINE_PLAYER_LOBBY,
            playingTable.lobbyId,
          );
        }
      }

      const lobbyWiseCounter = await getOnliPlayerCountLobbyWise(
        REDIS.ONLINE_PLAYER_LOBBY,
        playingTable.lobbyId,
      );

      if (lobbyWiseCounter == NUMERICAL.ZERO) {
        await removeOnliPlayerCountLobbyWise(
          REDIS.ONLINE_PLAYER_LOBBY,
          playingTable.lobbyId,
        );
      }

      // const data = roundScoreHistory.history
      // await setCurrentRoundDatas(tableId, data, userScore, winningAmount);

      // mark status completed.
      Object.keys(playerSeats).map(async ele => {
        const userDetail: userIf = await getUser(playerSeats[ele].userId);
        await markCompletedGameStatus(
          {
            tableId,
            gameId: userDetail.gameId,
            tournamentId: userDetail.lobbyId,
          },
          userDetail.authToken,
          userDetail.socketId,
        );
      });
    }

    // Send WINNER_DECLARE Event in Socket
    CommonEventEmitter.emit(EVENTS.WINNER_DECLARE_SOCKET_EVENT, {
      tableId: tableId,
      data: sendEventData,
    });

    const turnHistory = await getTurnHistory(tableId, currentRound);

    //  winning counter
    // if (winner.length == NUMERICAL.ONE) {
    //   setGameCounter(userScore, winner);
    // }

    logger.info(tableId, 'socre broad ::>');
    logger.info(
      tableId,
      `scoreOfRound :: turnHistory ::: 
      ${JSON.stringify(turnHistory)}
       :: playersPlayingData ::: 
      ${JSON.stringify(playersPlayingData)}`,
    );

    // const currentPlayersInTable = Object.keys(roundPlayingTable.seats).filter(
    //   (ele) => roundPlayingTable.seats[ele].userId,
    // ).length;

    Object.keys(roundPlayingTable.seats).filter(
      ele => roundPlayingTable.seats[ele],
    );

    const userScoreData: userScoreDataForGrpc[] = [];

    playersPlayingData.forEach(async (player, index) => {
      userScoreData.push({
        userId: player.userId,
        gameScore: player.isLeft ? -100 : player.point,
        // gameEndReason:
        //   winner.length === 1 && player.seatIndex === winner[0]
        //     ? 'won'
        //     : player.userStatus,
        // rummyType: playingTable.gameType,
        // lobbyId: playingTable.lobbyId,
        // uniqueId: `${GAME_PREFIX.SOLO}-${tableId}`,
        // startingUsersCount: currentPlayersInTable,
      });
    });

    if (winner.length === NUMERICAL.ZERO) {
      // Set Timer For New Round Start
      await Scheduler.addJob.initialNewRoundStartTimer({
        // timer: (gameStartTimer + NUMERICAL.ONE) * NUMERICAL.THOUSAND,
        timer: (NUMERICAL.FIVE + NUMERICAL.ONE) * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${currentRound}`,
        tableId: tableId,
        tie: false,
      });
    } else if (winner.length >= NUMERICAL.TWO) {
      // Set Timer For New Round Start
      await Scheduler.addJob.initialNewRoundStartTimer({
        timer: (NUMERICAL.FIVE + NUMERICAL.ONE) * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${currentRound}`,
        tableId: tableId,
        tie: true,
      });
    } else {
      // The Winner is Declare then Remove All Redis Data Related to this Game
      logger.info(tableId, 'scoreOfRound : Playing End.');
      // //logs add in aws s3 bucket
      // if(NODE_ENV == 'STAGE' || NODE_ENV == 'PRODUCTION') {
      //   await addLogsInS3Bucket(tableId, playerSeats);
      // }
      await removeAllPlayingTableAndHistory(
        playingTable,
        roundPlayingTable,
        currentRound,
      );
      logger.info(tableId, 'scoreOfRound : Playing End...');
    }
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : scoreOfRound : tableId: ${tableId} ::`,
      e,
    );

    if (e instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(e);
    }
  } finally {
    console.log(tableId, 'scoreOfRound : Lock : ', key);
    await getLock.release(scoreOfRoundLock);
  }
};

// Calculation of check Winner Of Round
const checkWinner = async (
  scoreData: userScoreIf[],
  winningScores: number[],
  isUserLeft: boolean,
  tableId: string,
) => {
  // winningScores = [-10, 10]; // for demo
  try {
    const playingTable: playingTableIf = await getTableData(tableId);
    const currentRound: number = playingTable.currentRound;
    const roundPlayingTable: roundTableIf = await getRoundTableData(
      tableId,
      currentRound,
    );

    scoreData = await Validator.methodValidator.checkWinnerValidator(scoreData);
    logger.info(
      tableId,
      'checkWinner : call scoreData :: ',
      scoreData,
      ' : winningScores :: ',
      winningScores,
    );

    const winIndex: number[] = [];
    if (isUserLeft) {
      const playersPlayingData = await Promise.all(
        scoreData.map(async ele => getPlayerGamePlay(ele.userId, tableId)),
      );

      playersPlayingData.forEach(async player => {
        if (player.isLeft == false) {
          winIndex.push(player.seatIndex);
        }
      });
      if (winIndex.length == NUMERICAL.ONE) {
        return winIndex;
      }
      if (winIndex.length == NUMERICAL.ZERO) {
        logger.info('winIndex.length :: >>> ', winIndex.length);
        await removeAllPlayingTableAndHistory(
          playingTable,
          roundPlayingTable,
          currentRound,
        );
      }
      return winIndex;
    }

    // totalPoint;
    const allUserTotalScore: number[] = [];
    scoreData.forEach(element => {
      if (!element.isLeft)
        allUserTotalScore.push(Number(element.totalPoint.toFixed(1)));
    });
    logger.info(tableId, 'allUserTotalScore :: >> ', allUserTotalScore);

    allUserTotalScore.sort((a, b) => b - a);
    const winnerPoint = allUserTotalScore[0];
    logger.info(tableId, 'winnerPoint :: >> ', winnerPoint);

    scoreData.forEach(element => {
      if (
        !element.isLeft &&
        winnerPoint === Number(element.totalPoint.toFixed(1))
      )
        winIndex.push(element.seatIndex);
    });

    // const loseIndex: number[] = [];
    // for (let i = 0; i < scoreData.length; i++) {
    //   if (scoreData[i].totalPoint <= winningScores[0] && !scoreData[i].isLeft) {
    //     loseIndex.push(i);
    //     logger.info('winner : 1 :: ', scoreData[i]);
    //   } else if (
    //     scoreData[i].totalPoint >= winningScores[1] &&
    //     !scoreData[i].isLeft
    //   ) {
    //     winIndex.push(i);
    //     logger.info('winner : 2 :: ', scoreData[i]);
    //   }
    // }

    // logger.info(
    //   'checkWinner : winIndex :: ',
    //   winIndex,
    //   ' : loseIndex :: ',
    //   loseIndex,
    // );

    // let winner = -1;
    // let winnerArray: number[] = [];
    // if (isUserLeft) {
    //   for (let i = 0; i < scoreData.length; i++) {
    //     if (!scoreData[i].isLeft) {
    //       winnerArray.push(i);
    //     }
    //   }
    // } else if (winIndex.length !== 0) {
    //   for (let i = 0; i < winIndex.length; i++) {
    //     if (winner === -1) {
    //       logger.info(
    //         'checkWinner : ',
    //         i,
    //         ' :: i : userScore[winIndex[i]] :: ',
    //         scoreData[winIndex[i]].totalPoint,
    //       );

    //       for (let j = 0; j < winIndex.length; j++) {
    //         logger.info(
    //           'checkWinner : ',
    //           j,
    //           ' :: j : userScore[winIndex[j]] :: ',
    //           scoreData[winIndex[j]].totalPoint,
    //         );
    //         if (
    //           scoreData[winIndex[i]].totalPoint <
    //           scoreData[winIndex[j]].totalPoint
    //         ) {
    //           logger.info('checkWinner : call if 11.');
    //           winner = -1;
    //           winnerArray = [];
    //           break;
    //         } else {
    //           if (i === j) {
    //             winnerArray.push(winIndex[i]);
    //           } else if (
    //             i != j &&
    //             scoreData[winIndex[i]].totalPoint ===
    //               scoreData[winIndex[j]].totalPoint
    //           ) {
    //             winnerArray.push(winIndex[j]);
    //           }
    //           logger.info('checkWinner : call else 11.');
    //           winner = winIndex[i];
    //         }
    //       }
    //     } else {
    //       logger.info('checkWinner : winner ::: ', winner);
    //       break;
    //     }
    //   }
    // } else if (loseIndex.length !== 0) {
    //   for (let i = 0; i < scoreData.length; i++) {
    //     if (winner === -1) {
    //       logger.info(
    //         'checkWinner : ',
    //         i,
    //         ' :: i : userScore[loseIndex[i]] : lose :: ',
    //         scoreData[i].totalPoint,
    //       );

    //       if (!scoreData[i].isLeft) {
    //         for (let j = 0; j < scoreData.length; j++) {
    //           if (!scoreData[j].isLeft) {
    //             logger.info(
    //               'checkWinner : ',
    //               j,
    //               ':: j : userScore[loseIndex[j]] : lose :: ',
    //               scoreData[j].totalPoint,
    //             );
    //             if (
    //               scoreData[i].totalPoint < scoreData[j].totalPoint
    //               // &&
    //               // !scoreData[j].isLeft
    //             ) {
    //               logger.info('checkWinner : lose call 22.');
    //               winner = -1;
    //               winnerArray = [];
    //               break;
    //             } else {
    //               if (i === j /*&& !scoreData[j].isLeft*/) {
    //                 winnerArray.push(scoreData[i].seatIndex);
    //               } else if (
    //                 i !== j &&
    //                 scoreData[i].totalPoint === scoreData[j].totalPoint
    //                 // &&
    //                 // !scoreData[j].isLeft
    //               ) {
    //                 winnerArray.push(scoreData[j].seatIndex);
    //               }
    //               logger.info('checkWinner : lose call else 22.');
    //               winner = scoreData[i].seatIndex;
    //             }
    //           }
    //         }
    //       }
    //     } else {
    //       logger.info('checkWinner : winner : 111 ::: ', winner);
    //       break;
    //     }
    //   }
    // }
    logger.info(tableId, 'checkWinner : win ::', winIndex);
    return winIndex;
  } catch (error) {
    logger.error(tableId, `CATCH_ERROR : checkWinner ::`, scoreData, error);
    throw error;
  }
};

// get Emit From Scheduler (initialNewRoundStartTimer)
CommonEventEmitter.on(
  EVENT_EMITTER.START_NEW_ROUND_TIMER,
  (res: initialNewRoundStartTimerIf) => {
    logger.info(res.tableId, 'Call on START_NEW_ROUND_TIMER ::: ', res);

    // Start next Round
    startNewRound(res.tableId, res.tie);
  },
);
export = scoreOfRound;
