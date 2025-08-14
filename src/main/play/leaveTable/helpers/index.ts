import logger from '../../../logger';
import Scheduler from '../../../scheduler';
import {
  getRoundTableData,
  getTableData,
  getPlayerGamePlay,
  setRoundTableData,
  popTableFromQueue,
  removeTableData,
  removePlayerGameData,
  removeRoundTableData,
  removeBidTurnHistory,
  removeTurnHistory,
  removeRoundScoreHistory,
  getRejoinTableHistory,
  setRejoinTableHistory,
  removeRejoinTableHistory,
  removeUser,
  pushTableInQueue,
  remTableFromQueue,
} from '../../../gameTable/utils';
import {
  TABLE_STATE,
  NUMERICAL,
  INSTRUMENTATION_EVENTS,
} from '../../../../constants';
import {playerPlayingDataIf} from '../../../interface/playerPlayingTableIf';
import {roundTableIf} from '../../../interface/roundTableIf';
import {playingTableIf} from '../../../interface/playingTableIf';
import cancelBattle from '../../cancelBattle';
import Errors from '../../../errors';
import CommonEventEmitter from '../../../commonEventEmitter';

// player leave on Waiting Mode
const userLeaveOnWaitingPlayer = async (
  playerInfo: playerPlayingDataIf,
  roundPlayingTable: roundTableIf,
  playingTable: playingTableIf,
) => {
  const {gameId, lobbyId, gameType}: any = playingTable;
  const {getLock} = global;
  const Key = `${gameType}:${gameId}:${lobbyId}`;
  const userLeaveOnWaitingPlayerLock = await getLock.acquire([Key], 2000);
  try {
    Object.keys(roundPlayingTable.seats).filter(key => {
      if (roundPlayingTable.seats[key].length != 0) {
        if (roundPlayingTable.seats[key].userId === playerInfo.userId)
          roundPlayingTable.seats[key] = {};
      }
    });

    roundPlayingTable.totalPlayers -= 1;
    roundPlayingTable.tableState = TABLE_STATE.WAITING_FOR_PLAYERS;

    logger.info(
      playerInfo.userId,
      'userLeaveOnWaitingPlayer :: roundPlayingTable :: >> ',
      roundPlayingTable,
    );
    await setRoundTableData(
      playingTable._id,
      playingTable.currentRound,
      roundPlayingTable,
    );

    await removePlayerGameData(playerInfo.userId, playingTable._id);
    logger.info(
      playerInfo.userId,
      'remove user from playing  :::::::==>>',
      playerInfo.userId,
    );

    await removeUser(playerInfo.userId);
    await removeRejoinTableHistory(playerInfo.userId, gameId, lobbyId);
  } catch (e) {
    logger.error(
      playerInfo.userId,
      `CATCH_ERROR : userLeaveOnWaitingPlayer : lobbyId: ${lobbyId} : gameType: ${gameType} : gameId: ${gameId} : tableId: ${playingTable._id}:: `,
      e,
    );
    throw e;
  } finally {
    await getLock.release(userLeaveOnWaitingPlayerLock);
  }
};

// remove playing table Document after All User Leave
const manageLeaveTable = async (tableId: string) => {
  const {getLock} = global;
  const key = `${NUMERICAL.ONE}:${tableId}`;
  const manageLeaveTableLock = await getLock.acquire([key], 2000);
  try {
    const playingTable: playingTableIf = await getTableData(tableId);
    const currentRound = playingTable.currentRound;
    const roundPlayingTable: roundTableIf = await getRoundTableData(
      tableId,
      currentRound,
    );

    logger.info(
      tableId,
      'manageLeaveTable : call : roundPlayingTable :: ',
      roundPlayingTable,
    );
    const userData = Object.keys(roundPlayingTable.seats).filter(
      ele => roundPlayingTable.seats[ele],
    );

    const playersPlayingData = await Promise.all(
      Object.keys(roundPlayingTable.seats).map(async ele =>
        getPlayerGamePlay(roundPlayingTable.seats[ele].userId, tableId),
      ),
    );

    // playersPlayingData.forEach(async (player, index) => {
    //   logger.info('manageLeaveTable : playersPlayingData : player ::', player);
    //   if (
    //     (roundPlayingTable.tableState === TABLE_STATE.WAITING_FOR_PLAYERS ||
    //       roundPlayingTable.tableState === TABLE_STATE.ROUND_STARTED) &&
    //     player !== null
    //   ) {
    //     // instrumentation call
    //     CommonEventEmitter.emit(INSTRUMENTATION_EVENTS.USER_TABLE_EXITED, {
    //       tableData: playingTable,
    //       tableGamePlay: roundPlayingTable,
    //       userData: player,
    //       isGameStarted: true,
    //       reason: 'User left',
    //     });
    //   } else if (player !== null) {
    //     // instrumentation call
    //     CommonEventEmitter.emit(INSTRUMENTATION_EVENTS.USER_TABLE_EXITED, {
    //       tableData: playingTable,
    //       tableGamePlay: roundPlayingTable,
    //       userData: player,
    //       isGameStarted: false,
    //       reason: 'User left',
    //     });
    //   }
    // });

    let ucount: number = 0;
    const noOfPlayer: number = Number(roundPlayingTable.noOfPlayer);

    Object.keys(roundPlayingTable.seats).filter(key => {
      logger.info(
        tableId,
        'manageLeaveTable : roundPlayingTable.seats[key].length :: ',
        Object.keys(roundPlayingTable.seats[key]).length,
        ' : manageLeaveTable : key :: ',
        key,
      );

      if (Object.keys(roundPlayingTable.seats[key]).length !== 0) {
        ucount += 1;
      }
    });

    logger.info(tableId, 'manageLeaveTable : ucount :: ', ucount);

    if (ucount === 0) {
      logger.info('manageLeaveTable : delete :');

      // Remove Playing Document and History
      removeAllPlayingTableAndHistory(
        playingTable,
        roundPlayingTable,
        currentRound,
      );
    } else if (ucount === 2 && noOfPlayer == NUMERICAL.TWO) {
      // delear Winner
      declareWinner(tableId);
    } else if (ucount === 4 && noOfPlayer == NUMERICAL.FOUR) {
      // delear Winner
      declareWinner(tableId);
    }
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : manageLeaveTable : tableId: ${tableId} :: `,
      e,
    );
    throw e;
  } finally {
    logger.info(tableId, 'manageLeaveTable : Lock : ', key);
    await getLock.release(manageLeaveTableLock);
  }
};

// Remove Playing Document and History
const removeAllPlayingTableAndHistory = async (
  playingTable: playingTableIf,
  roundPlayingTable: roundTableIf,
  updatedCurrentRound: number,
) => {
  logger.info(
    playingTable._id,
    'removeAllPlayingTableAndHistory : call : tableId :: ',
    playingTable._id,
  );
  logger.info(
    playingTable._id,
    'removeAllPlayingTableAndHistory : call : updatedCurrentRound :: ',
    updatedCurrentRound,
  );

  const {_id: tableId, currentRound, gameId, lobbyId, gameType} = playingTable;
  const {getLock} = global;
  const key = `${lobbyId}:${tableId}`;
  const removeAllPlayingTableAndHistoryLock = await getLock.acquire(
    [key],
    2000,
  );
  try {
    const {seats: playerSeats, tableState} = roundPlayingTable;
    logger.info(
      tableId,
      'removeAllPlayingTableAndHistory : tableId :: ',
      tableId,
    );
    const queueKey = `${gameType}:${lobbyId}`;

    if (tableState === TABLE_STATE.WAITING_FOR_PLAYERS) {
      //remove table on Queue
      logger.info(
        tableId,
        'removeAllPlayingTableAndHistory : popTableFromQueue :: popTableFromQueue.',
      );

      // await popTableFromQueue(queueKey);
      logger.info(tableId, ' remTableFromQueue :>> queueKey :: ', queueKey);
      await remTableFromQueue(queueKey, tableId);
    }

    //Remove Playing Table in redis
    await removeTableData(tableId);

    // Remove All User Deatil in Redis
    await Promise.all(
      Object.keys(playerSeats).filter(async ele => {
        if (Object.keys(playerSeats[ele]).length != 0) {
          const playerGamePlayData = await getPlayerGamePlay(
            playerSeats[ele].userId,
            tableId,
          );
          if (playerGamePlayData.isLeft == false) {
            removeUser(playerSeats[ele].userId);
          }

          logger.info(
            tableId,
            'remove user from playing:::::::::::::::::::2222222::::',
            playerSeats[ele].userId,
          );
          removePlayerGameData(playerSeats[ele].userId, tableId);
          const userRejoinInfo = await getRejoinTableHistory(
            playerSeats[ele].userId,
            gameId,
            lobbyId,
          );
          if (userRejoinInfo) {
            const storeInRedis = {
              userId: playerSeats[ele].userId,
              tableId,
              isEndGame: true,
            };
            await setRejoinTableHistory(
              playerSeats[ele].userId,
              gameId,
              lobbyId,
              storeInRedis,
            );
          }

          //turn timer and bid timer cancel.
          await Scheduler.cancelJob.playerTurnTimerCancel(
            `${playerSeats[ele].userId}:${tableId}:${currentRound}`,
          );

          // await Scheduler.cancelJob.playerBidTurnTimerCancel(
          //   `${playerSeats[ele].userId}:${tableId}:${currentRound}`,
          // );

          await Scheduler.cancelJob.newRoundStartTimerCancel(
            `${tableId}:${updatedCurrentRound}`,
          );
        }
      }),
    );

    for (let i = 1; i <= currentRound; i++) {
      logger.info(
        logger.info,
        'removeAllPlayingTableAndHistory : remove : i :: ',
        i,
      );
      // Remove All Round Detail in Redis
      removeRoundTableData(tableId, i);
      // Remove All Round Bid History Detail in Redis
      removeBidTurnHistory(tableId, i);
      // Remove All Round Turn History Detail in Redis
      removeTurnHistory(tableId, i);
    }

    //Remove Scour History in redis
    await removeRoundScoreHistory(tableId);
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : removeAllPlayingTableAndHistory : tableId:${tableId} :: currentRound:${currentRound} :: gameId: ${gameId} :: lobbyId: ${lobbyId} :: gameType: ${gameType} : `,
      e,
    );
  } finally {
    logger.info(tableId, 'removeAllPlayingTableAndHistory : Lock : ', key);
    await getLock.release(removeAllPlayingTableAndHistoryLock);
  }
};

// delear Winner
const declareWinner = async (tableId: string) => {
  logger.info(`declareWinner ::: call`);
  const {getLock} = global;
  const key = `${tableId}:${NUMERICAL.TEN}`;
  const declareWinnerLock = await getLock.acquire([tableId], 2000);
  try {
    logger.info(tableId, `declareWinner ::: call next`);
    const playingTable: playingTableIf = await getTableData(tableId);
    const currentRound = playingTable.currentRound;
    const roundPlayingTable: roundTableIf = await getRoundTableData(
      tableId,
      currentRound,
    );

    const playerSeats = roundPlayingTable.seats;
    const noOfPlayer: number = Number(roundPlayingTable.noOfPlayer);
    logger.info(
      tableId,
      `declareWinner ::: call next One :: playerSeats : ${JSON.stringify(playerSeats)}`,
    );
    const playersPlayingData: playerPlayingDataIf[] = await Promise.all(
      Object.keys(playerSeats).map(async ele =>
        getPlayerGamePlay(playerSeats[ele].userId, tableId),
      ),
    );

    let isUserLeftCount = NUMERICAL.ZERO;
    logger.info(tableId, `declareWinner ::: call next Two`);
    for (let i = 0; i < playersPlayingData.length; i++) {
      const player = playersPlayingData[i];
      if (player.isLeft) {
        isUserLeftCount += NUMERICAL.ONE;
      }
    }

    logger.info(`declareWinner ::: isUserLeftCount : ${isUserLeftCount}`);
    if (isUserLeftCount >= NUMERICAL.ONE && noOfPlayer == NUMERICAL.TWO) {
      logger.info(tableId, 'declareWinner Timer in Leave User');
      await Scheduler.addJob.winnerDeclareTimer({
        timer: NUMERICAL.ZERO * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${currentRound}`,
        tableId: tableId.toString(),
      });
    }
    if (isUserLeftCount >= NUMERICAL.THREE && noOfPlayer == NUMERICAL.FOUR) {
      logger.info(tableId, 'declareWinner Timer in Leave User');
      logger.info(tableId, 'roundPlayingTable :>> ', roundPlayingTable);
      await Scheduler.addJob.winnerDeclareTimer({
        timer: NUMERICAL.ZERO * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${currentRound}`,
        tableId: tableId.toString(),
      });
    }
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : declareWinner : tableId: ${tableId} :: `,
      e,
    );
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    logger.info(tableId, 'declareWinner : Lock : ', key);
    await getLock.release(declareWinnerLock);
  }
};

const userLeaveOnLock = async (
  playerInfo: playerPlayingDataIf,
  roundPlayingTable: roundTableIf,
  playingTable: playingTableIf,
  isDeductedEntryFee: boolean,
) => {
  const {_id: tableId, currentRound, gameId, lobbyId, gameType} = playingTable;

  let sendStatus = false;
  logger.info(
    'userLeaveOnLock  :: isDeductedEntryFee ::>>',
    isDeductedEntryFee,
  );
  if (
    roundPlayingTable.tableState === TABLE_STATE.ROUND_TIMER_STARTED ||
    !isDeductedEntryFee
  ) {
    const queueKey = `${gameType}:${lobbyId}`;
    await Scheduler.cancelJob.initializeGameplayCancel(`${tableId}`);
    await Scheduler.cancelJob.roundStartTimerCancel(`${tableId}`);
    await userLeaveOnWaitingPlayer(playerInfo, roundPlayingTable, playingTable);

    await pushTableInQueue(queueKey, tableId);
  } else if (roundPlayingTable.tableState === TABLE_STATE.LOCK_IN_PERIOD) {
    sendStatus = true;
  }
  return sendStatus;
};
const exportObject = {
  userLeaveOnWaitingPlayer,
  manageLeaveTable,
  removeAllPlayingTableAndHistory,
  declareWinner,
  userLeaveOnLock,
};
export = exportObject;
