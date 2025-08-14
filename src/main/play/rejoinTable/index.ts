import logger from "../../logger";
import Scheduler from "../../scheduler";
import CommonEventEmitter from "../../commonEventEmitter";
import REDIS from "../../redis";
import socketAck from "../../../socketAck";
import {
  getPlayerGamePlay,
  getTableData,
  getRoundTableData,
  setPlayerGamePlay,
  getRoundScoreHistory,
  getUser,
  setUser,
  getTurnHistory,
  setTurnHistory,
} from "../../gameTable/utils";
import {
  EVENTS,
  TABLE_STATE,
  NUMERICAL,
  INSTRUMENTATION_EVENTS,
} from "../../../constants";
import {
  formatRejoinTableInfo,
  formatScoreData,
  formatScoreDataForWinner,
  formatSingUpInfo,
} from "../helpers/playHelper";
import { getTimeDifference } from "../helpers/playHelper";
import { playerPlayingDataIf } from "../../interface/playerPlayingTableIf";
import { playingTableIf } from "../../interface/playingTableIf";
import { roundTableIf } from "../../interface/roundTableIf";
import { PREFIX } from "../../../constants/redis";
import { formatWinnerDeclareIf } from "../../interface/responseIf";
import { userIf } from "../../interface/userSignUpIf";

// user back in game play
const rejoinPlayingTable = async (
  userId: string,
  tableId: string,
  roomFlag: boolean,
  socket: any,
  flag: boolean,
  ack?: Function
) => {
  const { getLock } = global;
  const rejoinPlayingTableLock = await getLock.acquire([userId], 2000);
  try {
    const {
      getConfigData: { TIME_OUT_COUNT },
    } = global;

    await Scheduler.cancelJob.rejoinTimerCancel(`${tableId}:${userId}`);
    const playingTable: playingTableIf = await getTableData(tableId);
    const { currentRound } = playingTable;
    let userTurnTimer = playingTable.userTurnTimer;
    let gameStartTimer = playingTable.gameStartTimer;
    const roundPlayingTable: roundTableIf = await getRoundTableData(
      tableId,
      currentRound
    );
    const playerPlayingData: playerPlayingDataIf = await getPlayerGamePlay(
      userId,
      tableId
    );
    logger.info(tableId, `rejoinPlayingTable :: get : playerPlayingData :: >>`, playerPlayingData);
    const { seatIndex } = playerPlayingData;
    const playerSeats = roundPlayingTable.seats;
    playerPlayingData.socketId = socket.id;

    if (
      playerPlayingData.turnTimeout >= TIME_OUT_COUNT ||
      playerPlayingData.isAuto
    ) {
      playerPlayingData.turnTimeout = NUMERICAL.ZERO;
      playerPlayingData.isAuto = false; // change
    }
    logger.info(tableId, `rejoinPlayingTable :: set : playerPlayingData :: >>`, playerPlayingData);
    await setPlayerGamePlay(userId, tableId, playerPlayingData);

    logger.info(tableId,
      "rejoinPlayingTable : playingTable :: ",
      playingTable,
      " : rejoinPlayingTable : roundPlayingTable :: ",
      roundPlayingTable,
      " : rejoinPlayingTable : playerSeats :: ",
      playerSeats,
      " : rejoinPlayingTable : playerPlayingData :: ",
      playerPlayingData,
      " : rejoinPlayingTable : userId :: ",
      userId
    );

    const playersPlayingData: any = await Promise.all(
      Object.keys(playerSeats).map(
        async (ele) =>
          // if (Object.keys(playerSeats[ele]).length !== 0) {
          getPlayerGamePlay(playerSeats[ele].userId, tableId)
        // }
      )
    );

    for (let i = 0; i < playersPlayingData.length; i++) {
      if (playersPlayingData[i] === null) {
        logger.info(tableId,
          "rejoinPlayingTable : playersPlayingData[i] in for ::: ",
          playersPlayingData[i]
        );
        playersPlayingData.splice(i, 1, {});
      }
      if (roundPlayingTable.currentTurn != null) {
        if (roundPlayingTable.currentTurn === playersPlayingData[i].userId) {
          roundPlayingTable.currentTurn = playersPlayingData[i].seatIndex;
        }
      }
      if (
        typeof roundPlayingTable.dealerPlayer != "undefined" &&
        roundPlayingTable.dealerPlayer != null
      ) {
        if (roundPlayingTable.dealerPlayer === playersPlayingData[i].userId) {
          roundPlayingTable.dealerPlayer = playersPlayingData[i].seatIndex;
        }
      }
    }
    if (roundPlayingTable.currentTurn === null) {
      roundPlayingTable.currentTurn = -1;
    }
    logger.info(tableId,
      "rejoinPlayingTable : playersPlayingData : leave table : playersPlayingData :: ",
      playersPlayingData
    );

    roundPlayingTable.isBidTurn = false;
    playersPlayingData.every(async (player: playerPlayingDataIf | null) => {
      logger.info(tableId, "rejoinPlayingTable : player in every :: ", player);
      if (player != null) {
        if (!roundPlayingTable.isBidTurn) {
          if (!player.bidTurn) {
            roundPlayingTable.isBidTurn = true;
            return false;
          } else {
            roundPlayingTable.isBidTurn = false;
            return true;
          }
        } else {
          logger.info(tableId,
            "rejoinPlayingTable : log : roundPlayingTable.isBidTurn :: ",
            roundPlayingTable.isBidTurn
          );
          return true;
        }
      } else {
        logger.info(tableId, "rejoinPlayingTable : Not Found :: ", player);
        return true;
      }
    });
    // userTurnTimer += 1;

    const difftime = await getTimeDifference(roundPlayingTable.tableCurrentTimer, new Date());
    const time = userTurnTimer - difftime;
    let currentTurnTimer = 0;
    if (time > 0 && time <= userTurnTimer) {
      currentTurnTimer = time;
    }

    if (
      roundPlayingTable.tableState === TABLE_STATE.LOCK_IN_PERIOD ||
      roundPlayingTable.tableState === TABLE_STATE.ROUND_TIMER_STARTED ||
      roundPlayingTable.tableState === TABLE_STATE.SCOREBOARD_DECLARED
    ) {
      // check if  the current state is the same as the and currentRound not the 1
      // if(roundPlayingTable.tableState === TABLE_STATE.SCOREBOARD_DECLARED || roundPlayingTable.currentRound !== 1){
      //   gameStartTimer = NUMERICAL.FIVE
      // }
      const gameStartTime = gameStartTimer - difftime;

      let currentGameStartTimer = 0;
      if (gameStartTime > 0 && gameStartTime <= gameStartTimer) {
        currentGameStartTimer = gameStartTime;
      }

      logger.info(tableId,
        'rejoinPlayingTable : gameStartTime ::',
        gameStartTime,
        'rejoinPlayingTable : currentGameStartTimer ::',
        currentGameStartTimer,
      );
      playingTable.gameStartTimer = currentGameStartTimer;
    }
    else {
      playingTable.gameStartTimer = NUMERICAL.ZERO
    }
    logger.info(tableId,
      "rejoinPlayingTable : time ::",
      time,
      "rejoinPlayingTable : currentTurnTimer ::",
      currentTurnTimer
    );

    roundPlayingTable.currentTurnTimer = currentTurnTimer;

    logger.info(tableId, "rejoinPlayingTable : playingTable ::: ", playingTable);
    socket.eventMetaData = {
      userId: roundPlayingTable.seats[`s${seatIndex}`].userId,
      userObjectId: roundPlayingTable.seats[`s${seatIndex}`]._id,
      tableId,
      roundId: roundPlayingTable._id,
      currentRound: currentRound,
    };

    // const keyForUser = `${PREFIX.USER}:${socket.eventMetaData.userId}`;
    // const userData = await REDIS.commands.getValueFromKey(keyForUser);

    const userData: userIf = await getUser(userId);
    logger.info(tableId, " userData :: =>>", userData);

    const sendEventData = await formatRejoinTableInfo(
      playerPlayingData,
      playingTable,
      roundPlayingTable,
      playersPlayingData,
      userData.balance
    );
    const eventSignUpData = await formatSingUpInfo(userData);

    // const userProfile : userIf = await getUser(userId);
    userData.tableId = tableId;
    await setUser(userId, userData);

    logger.info(tableId, "sendEventData tableData :: >>", JSON.stringify(sendEventData));
    logger.info(tableId, "eventSignUpData :: >>", eventSignUpData);
    logger.info(tableId, "flag :: >>", flag);

    socketAck.ackMid(
      EVENTS.SIGN_UP_SOCKET_EVENT,
      {
        SIGNUP: eventSignUpData,
        GAME_TABLE_INFO: sendEventData,
      },
      socket.userId,
      tableId,
      ack
    );


    if (roomFlag) {
      // add user in playing Room
      CommonEventEmitter.emit(EVENTS.ADD_PLAYER_IN_TABLE_ROOM, {
        socket,
        data: { tableId },
      });
    }

    // send back_in_game_playing Socket Event
    // replace with join table
    CommonEventEmitter.emit(EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT, {
      tableId: tableId,
      data: { seatIndex },
    });
    logger.info(tableId, 'roundPlayingTable.tableState :==>> ', roundPlayingTable.tableState, JSON.stringify(roundPlayingTable));
    if (roundPlayingTable.tableState === TABLE_STATE.SCOREBOARD_DECLARED) {
      logger.info(tableId, ' <<-----:  SCOREBOARD_DECLARED :----->> ');
      const difftime = await getTimeDifference(
        roundPlayingTable.tableCurrentTimer,
        new Date()
      );
      const time = gameStartTimer - difftime;

      let currentGameStartTimer = 0;
      if (time > 0 && time <= gameStartTimer) {
        currentGameStartTimer = time;
      }

      let roundScoreHistory = await getRoundScoreHistory(tableId);
      logger.info(tableId, 'roundScoreHistory ::==>> ', JSON.stringify(roundScoreHistory));
      roundScoreHistory = roundScoreHistory || { history: [] };

      const roundScore = await formatScoreDataForWinner(roundScoreHistory.history);
      logger.info(tableId, 'roundScore ::===>> ', JSON.stringify(roundScore));

      // const sendEventData = {
      //   timer: currentGameStartTimer,
      //   roundScoreHistory: roundScoreHistory.history,
      // };
      let winnerSI: any[] = [];
      for (let i = 1; i <= Number(roundPlayingTable.noOfPlayer); i++) {
        const turnHistory = await getTurnHistory(tableId, i);
        logger.info(tableId, 'turnHistory ::==>> ', JSON.stringify(turnHistory));
        if (turnHistory && turnHistory.winnerSI.length !== NUMERICAL.ZERO) {
          winnerSI = turnHistory.winnerSI;
          break;
        }
      }
      console.log('SCOREBOARD_DECLARED : currentTurnTimer  :>> ', currentGameStartTimer, "winnerSI :: >>", winnerSI);

      let sendEventData: formatWinnerDeclareIf = {
        timer: currentGameStartTimer,
        winner: winnerSI,
        roundScoreHistory: roundScore,
        roundTableId: tableId,
        nextRound: roundPlayingTable.currentRound
      };


      // send Winner_Declare Socket Event
      CommonEventEmitter.emit(EVENTS.WINNER_DECLARE_SOCKET_EVENT, {
        socket,
        data: sendEventData,
      });
    }

    // instrumentation call // remove
    // CommonEventEmitter.emit(INSTRUMENTATION_EVENTS.USER_GAME_REJOINED, {
    //   tableData: playingTable,
    //   tableGamePlay: roundPlayingTable,
    //   userData: playerPlayingData,
    //   isRejoin: true,
    //   reason: 'Rejoined successfully',
    // });
  } catch (e) {
    logger.error(tableId,
      `CATCH_ERROR : rejoinPlayingTable :: userId: ${userId} : tableId: ${tableId}`,
      e
    );
  } finally {
    await getLock.release(rejoinPlayingTableLock);
  }
};

export = rejoinPlayingTable;
