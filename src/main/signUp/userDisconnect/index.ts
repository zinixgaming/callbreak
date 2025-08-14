import logger from '../../logger';
import {getConfig} from '../../../config';
const {REJOIN_TIMER} = getConfig();
import Scheduler from '../../scheduler';
import CommonEventEmitter from '../../commonEventEmitter';
import {
  EVENT_EMITTER,
  TABLE_STATE,
  NUMERICAL,
  PLAYER_STATE,
  REDIS,
} from '../../../constants';
import leaveTable from '../../play/leaveTable';
import rejoinTableTimerExpire from '../../play/rejoinTable/rejoinTableTimerExpire';
import {
  getTableData,
  getRoundTableData,
  setRejoinTableHistory,
  getPlayerGamePlay,
  getOnliPlayerCount,
  decrCounter,
  incrCounterLobbyWise,
  decrCounterLobbyWise,
  getUser,
} from '../../gameTable/utils';
import cancelBattle from '../../play/cancelBattle';
import Errors from '../../errors';
import {removeAllPlayingTableAndHistory} from '../../play/leaveTable/helpers';

// call On socket disconnect
const userDisconnect = async (socket: any) => {
  logger.info('userDisconnect : REJOIN_TIMER :: : ', REJOIN_TIMER);
  logger.info(
    '  userDisconnect : socket.eventMetaData :: ',
    socket.eventMetaData,
  );

  if (
    socket.eventMetaData === undefined ||
    socket.eventMetaData.tableId === undefined
  ) {
    logger.info(
      `disconnect eventMetaData is not found :: Ignore this error message`,
    );
    throw new Error('disconnect eventMetaData is not found');
  }

  const {tableId, userId} = socket.eventMetaData;
  const {getLock} = global;
  const disconnectLock = await getLock.acquire([userId], 2000);
  try {
    if (
      typeof userId != 'undefined' &&
      userId != '' &&
      userId != null &&
      typeof tableId != 'undefined' &&
      tableId != '' &&
      tableId != null
    ) {
      logger.info(
        tableId,
        'userDisconnect : socket.eventMetaData ::: ',
        socket.eventMetaData,
        'userDisconnect : userId ::: ',
        userId,
        'userDisconnect : tableId ::: ',
        tableId,
      );

      const playingTable = await getTableData(tableId);
      const userPlayingTable = await getPlayerGamePlay(userId, tableId);
      const getUserDetail = await getUser(userId);

      if (playingTable != null) {
        const {currentRound, lobbyId, gameId, isFTUE} = playingTable;
        const roundPlayingTable = await getRoundTableData(
          tableId,
          currentRound,
        );
        logger.info(tableId, 'playingTable :: ', playingTable);
        logger.info(
          tableId,
          'roundPlayingTable :disconnect: ',
          roundPlayingTable,
        );
        if (roundPlayingTable.tableState != TABLE_STATE.WAITING_FOR_PLAYERS) {
          const storeInRedis = {
            userId,
            tableId,
            isEndGame: false,
          };
          const socketData = {
            id: socket.id,
            eventMetaData: {
              userId,
              tableId,
              currentRound: currentRound,
            },
          };
          logger.info(tableId, ' isFTUE is --------------', isFTUE);
          // if (roundPlayingTable.tableState === TABLE_STATE.SCOREBOARD_DECLARED) {
          //   await decrCounterLobbyWise(REDIS.ONLINE_PLAYER_LOBBY, getUserDetail.lobbyId)
          // }

          if (!isFTUE) {
            await setRejoinTableHistory(userId, gameId, lobbyId, storeInRedis);
            // await incrCounterLobbyWise(REDIS.ONLINE_PLAYER_LOBBY , lobbyId)
          } else
            await removeAllPlayingTableAndHistory(
              playingTable,
              roundPlayingTable,
              currentRound,
            );
        } else {
          logger.info(tableId, 'userDisconnect : call else.');
          const socketData = {
            id: socket.id,
            eventMetaData: {
              userId,
            },
          };
          logger.info(
            tableId,
            'userDisconnect : socket.id ::  ',
            socket.id,
            'userDisconnect :: userPlayingTable.socketId : socketId :: ',
            userPlayingTable.socketId,
          );

          if (userPlayingTable.socketId == socket.id) {
            await Scheduler.addJob.leaveTableTimer({
              timer: NUMERICAL.ZERO * NUMERICAL.THOUSAND,
              jobId: `${userId}:${currentRound}`,
              tableId,
              flag: PLAYER_STATE.DISCONNECT,
              userScoket: socketData,
            });
          }
        }
      } else {
        logger.info(
          tableId,
          'userDisconnect : leave user on.',
          'userDisconnect : socketId :: 1 ::: ',
          socket.id,
          'userDisconnect : userPlayingTable.socketId :: ',
          userPlayingTable.socketId,
        );

        if (userPlayingTable.socketId == socket.id) {
          leaveTable(tableId, PLAYER_STATE.DISCONNECT, socket);
        }
      }
    } else {
      logger.info(
        tableId,
        'userDisconnect : data not proper in userDisconnect :: ',
        socket.eventMetaData,
      );
    }
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : userDisconnect : userDisconnect :: userId: ${
        socket.eventMetaData !== undefined &&
        socket.eventMetaData.userId !== undefined
          ? socket.eventMetaData.userId
          : ''
      } :: tableId: ${
        socket.eventMetaData !== undefined &&
        socket.eventMetaData.tableId !== undefined
          ? socket.eventMetaData.tableId
          : ''
      } ::`,
      e,
    );

    // if (e instanceof Errors.CancelBattle) {
    //   await cancelBattle({
    //     tableId,
    //     errorMessage: e,
    //   });
    // }
  } finally {
    await getLock.release(disconnectLock);
  }
};

export = userDisconnect;

// get from scheduler
CommonEventEmitter.on(EVENT_EMITTER.REJOIN_TIMER_EXPIRED, (res: any) => {
  rejoinTableTimerExpire(res);
});
