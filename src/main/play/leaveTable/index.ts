export = leaveTable;

import logger from '../../logger';
import {
  getTableData,
  getRoundTableData,
  getPlayerGamePlay,
  setPlayerGamePlay,
  getUser,
  setUser,
  decrCounterLobbyWise,
  removeUser,
} from '../../gameTable/utils';
import Scheduler from '../../scheduler';
import {
  TABLE_STATE,
  PLAYER_STATE,
  ERROR_TYPE,
  INSTRUMENTATION_EVENTS,
  GAME_TYPE,
  NUMERICAL,
  EMPTY,
  REDIS,
} from '../../../constants';
import CommonEventEmitter from '../../commonEventEmitter';
import {EVENTS, MESSAGES} from '../../../constants';
import leaveTableHelper from './helpers';
import setBidOnTurnExpire from '../helpers/turn/bidTurn/bidTurnExpire';
import cardThrowTurnExpire from '../helpers/turn/cardThrow/turnExpire';
import {playerPlayingDataIf} from '../../interface/playerPlayingTableIf';
import {playingTableIf} from '../../interface/playingTableIf';
import {roundTableIf} from '../../interface/roundTableIf';
import {throwErrorIF} from '../../interface/throwError';
import socketAck from '../../../socketAck';
import {markCompletedGameStatus} from '../../clientsideapi';
import {userIf} from '../../interface/userSignUpIf';

/*
  Manage User Leave Table
*/

async function leaveTable(
  tableId: string,
  flag: string,
  socket: any,
  ack?: (response: any) => void,
  isDeductedEntryFee = true,
  isLeaveFromScoreBoard: boolean = false,
  // isAlreadyPlay = false
): Promise<any> {
  const socketId = socket.id;
  const {getLock} = global;
  logger.info(
    tableId,
    'leaveTable :: tableId : ' + tableId + ' :: flag : ' + flag,
    ' :: socket.eventMetaData : ' + JSON.stringify(socket.eventMetaData),
  );
  logger.info(
    tableId,
    'leaveTable :: tableId : ' + tableId,
    'isDeductedEntryFee ::>> ',
    isDeductedEntryFee,
    'isLeaveFromScoreBoard ::>> ',
    isLeaveFromScoreBoard,
  );
  const {userId, userObjectId} = socket.eventMetaData;

  const key = `${GAME_TYPE.SOLO}:${tableId}`;

  logger.info(
    tableId,
    `leaveTable :: userId : ${userId} :: user : ${userObjectId}`,
  );

  // set lock;
  const leaveTableLock = await getLock.acquire([key], 2000);
  try {
    if (typeof flag === 'undefined' || flag === '' || flag === null) flag = '';

    const {
      getConfigData: {
        USER_PROFILE_INACTIVE,
        TIME_OUT_POPUP_MESSAGE,
        USER_PROFILE_INACTIVE_ON_LEFT,
        LOCK_IN_STATE,
      },
    } = global;

    let playerLeave: boolean = false;
    const playingTable: playingTableIf = await getTableData(tableId);
    if (playingTable === null) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.LEAVE_TABLE_CARD_ERROR,
        message: MESSAGES.ERROR.TABLE_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }
    const {currentRound} = playingTable;
    const roundPlayingTable: roundTableIf = await getRoundTableData(
      tableId,
      currentRound,
    );

    logger.info(
      tableId,
      `leaveTable :: roundPlayingTable ::: ${roundPlayingTable}  roundPlayingTable.tableState : ${roundPlayingTable.tableState}`,
    );
    if (typeof userId === 'undefined' || userId === '' || userId === null) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.LEAVE_TABLE_CARD_ERROR,
        message: MESSAGES.ERROR.USER_ID_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    const playerPlayingData: playerPlayingDataIf = await getPlayerGamePlay(
      userId,
      tableId,
    );
    if (playerPlayingData === null) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.LEAVE_TABLE_CARD_ERROR,
        message: MESSAGES.ERROR.USER_DETAIL_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    if (
      !isLeaveFromScoreBoard &&
      roundPlayingTable.tableState === TABLE_STATE.SCOREBOARD_DECLARED &&
      playingTable.winner.length === NUMERICAL.ONE
    ) {
      return false;
    }
    if (roundPlayingTable.tableState === TABLE_STATE.WAITING_FOR_PLAYERS) {
      logger.info(tableId, ' WAITING_FOR_PLAYERS :: flag ::: >> ', flag);
      playerLeave = true;

      const userDetail: userIf = await getUser(userId);
      await markCompletedGameStatus(
        {
          tableId,
          gameId: userDetail.gameId,
          tournamentId: userDetail.lobbyId,
        },
        userDetail.authToken,
        socketId,
      );

      // const decrCounter = await decrCounterLobbyWise(REDIS.ONLINE_PLAYER_LOBBY, playingTable.lobbyId);
      // logger.info("WAITING_FOR_PLAYERS :: decrCounter ::>> ", decrCounter);

      await leaveTableHelper.userLeaveOnWaitingPlayer(
        playerPlayingData,
        roundPlayingTable,
        playingTable,
      );
    }
    // user leave on Round timer Started time and locking state
    else if (
      currentRound === NUMERICAL.ONE &&
      flag === PLAYER_STATE.LEFT &&
      (roundPlayingTable.tableState === TABLE_STATE.ROUND_TIMER_STARTED ||
        roundPlayingTable.tableState === TABLE_STATE.LOCK_IN_PERIOD)
    ) {
      const leaveStatus = await leaveTableHelper.userLeaveOnLock(
        playerPlayingData,
        roundPlayingTable,
        playingTable,
        isDeductedEntryFee,
      );
      logger.info(tableId, 'leaveStatus :>>', leaveStatus);
      if (leaveStatus) {
        CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
          socket,
          data: {
            isPopup: true,
            popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOP_TOAST_POPUP,
            title: MESSAGES.ALERT_MESSAGE.POPUP_TITLE,
            message: LOCK_IN_STATE
              ? LOCK_IN_STATE
              : MESSAGES.ALERT_MESSAGE.LOCK_IN_STATE,
          },
        });
        throw new Error('user try to leave in lock in state');
      } else {
        playerLeave = true;
      }
    } else {
      if (flag === PLAYER_STATE.LEFT) {
        playerPlayingData.isLeft = true;
      }
      playerPlayingData.isAuto = true;
      playerPlayingData.userStatus = flag;
      await setPlayerGamePlay(userId, tableId, playerPlayingData);
    }
    // turn start and user leave a table
    if (roundPlayingTable.currentTurn === userId) {
      // if (roundPlayingTable.tableState === TABLE_STATE.BID_ROUND_STARTED) {
      //   await Scheduler.cancelJob.playerBidTurnTimerCancel(
      //     `${userId}:${tableId}:${currentRound}`,
      //   );
      //   logger.info(tableId,
      //     'leaveTable : setBidOnTurnExpire -- ',
      //     typeof setBidOnTurnExpire,
      //   );

      //   setBidOnTurnExpire(playerPlayingData, playingTable);
      // }

      if (roundPlayingTable.tableState === TABLE_STATE.ROUND_STARTED) {
        await Scheduler.cancelJob.playerTurnTimerCancel(
          `${userId}:${tableId}:${currentRound}`,
        );
        logger.info(
          tableId,
          'leaveTable : cardThrowTurnExpire : typeof :: ',
          typeof cardThrowTurnExpire,
        );
        cardThrowTurnExpire(playerPlayingData, playingTable);
      }
    }
    logger.info(tableId, 'leaveTable : calll :: ');

    await leaveTableHelper.manageLeaveTable(tableId);

    const leaveTableEventRequest: any = {
      seatIndex: playerPlayingData.seatIndex,
      playerLeave,
      msg: PLAYER_STATE.DISCONNECTED,
      // isAlreadyPlay
      // msg: USER_PROFILE_INACTIVE,
    };
    if (playerPlayingData.userStatus === PLAYER_STATE.LEFT) {
      // leaveTableEventRequest.msg = USER_PROFILE_INACTIVE_ON_LEFT;
      leaveTableEventRequest.msg = PLAYER_STATE.LEFT;
    }
    if (roundPlayingTable.tableState === TABLE_STATE.WAITING_FOR_PLAYERS) {
      leaveTableEventRequest.msg = PLAYER_STATE.LEFT;
    }

    // send Leave Table Socket Event
    CommonEventEmitter.emit(EVENTS.LEAVE_TABLE_SCOKET_EVENT, {
      socket: socket.id,
      flag,
      tableId,
      data: leaveTableEventRequest,
    });

    if (flag === PLAYER_STATE.TIMEOUT) {
      // show time out Popup (i am back popup)
      CommonEventEmitter.emit(EVENTS.TIME_OUT_LEAVE_TABLE_POPUP_SCOKET_EVENT, {
        socket: socket.id,
        data: {
          tital: MESSAGES.ALERT_MESSAGE.POPUP_TITLE,
          msg: TIME_OUT_POPUP_MESSAGE,
        },
      });
    } else {
      const decrCounter = await decrCounterLobbyWise(
        REDIS.ONLINE_PLAYER_LOBBY,
        playingTable.lobbyId,
      );
      logger.info('flag :: LEFT :: decrCounter ::>> ', decrCounter);

      const userDetail: userIf = await getUser(userId);
      userDetail.tableId = EMPTY;

      // user leave api call
      await markCompletedGameStatus(
        {
          tableId,
          gameId: userDetail.gameId,
          tournamentId: userDetail.lobbyId,
        },
        userDetail.authToken,
        socketId,
      );
      await setUser(userId, userDetail);
      await removeUser(userId);
    }
    return true;
  } catch (error: any) {
    logger.error(
      tableId,
      `CATCH_ERROR : leaveTable :: tableId: ${tableId} :: userId: ${userId} :: `,
      error,
    );

    if (error && error.type === ERROR_TYPE.LEAVE_TABLE_CARD_ERROR) {
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: false,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
          message: error.message,
        },
      });
    }
    if (ack) {
      socketAck.ackMid(
        EVENTS.LEAVE_TABLE_SCOKET_EVENT,
        {
          success: false,
          error: {
            errorCode: 401,
            errorMessage: error && error.message ? error.message : error,
          },
          tableId,
        },
        // socket.metrics,
        socket.userId,
        tableId,
        ack,
      );
    }
  } finally {
    logger.info('leaveTable : Lock : ', key);
    await getLock.release(leaveTableLock);
  }
}
