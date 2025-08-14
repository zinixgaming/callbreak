import logger from '../../../../logger';
import {
  getPlayerGamePlay,
  setPlayerGamePlay,
  getRoundTableData,
  setRoundTableData,
  getTableData,
} from '../../../../gameTable/utils';
import { ERROR_TYPE, EVENTS, MESSAGES, NUMERICAL, TABLE_STATE } from '../../../../../constants';
import CommonEventEmitter from '../../../../commonEventEmitter';
import Scheduler from '../../../../scheduler';
import changeTurn from './changeTurn';
import { playerPlayingDataIf } from '../../../../interface/playerPlayingTableIf';
import { roundTableIf } from '../../../../interface/roundTableIf';
import { playingTableIf } from '../../../../interface/playingTableIf';
import socketAck from '../../../../../socketAck';
import { throwErrorIF } from '../../../../interface/throwError';
import cancelBattle from '../../../cancelBattle';
import Errors from '../../../../errors';
import { setBidRequestIf } from '../../../../interface/requestIf';
import { formatUserBidShow } from '../../playHelper';

// Player Set Bid Volume
async function setBid(data: setBidRequestIf, socket: any, ack?: Function) {
  const { bid } = data;
  const { tableId, userId } = socket.eventMetaData;
  const { getLock } = global;
  const setBidLock = await getLock.acquire([tableId], 2000);
  try {
    const playingTable: playingTableIf = await getTableData(tableId);
    const { currentRound } = playingTable;

    const promises = await Promise.all([
      getPlayerGamePlay(userId, tableId),
      getRoundTableData(tableId, currentRound),
    ]);

    const playerObj: playerPlayingDataIf = promises[0];
    const roundObj: roundTableIf = promises[1];

    if (playerObj.bidTurn) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_BID_ERROR,
        message: "You have already select bid",
        isToastPopup: true,
      };
      throw errorObj;
    }

    playerObj.bid = bid;
    playerObj.bidTurn = true;


    await Promise.all([
      setPlayerGamePlay(userId, tableId, playerObj),
      setRoundTableData(tableId, currentRound, roundObj),
    ]);

    const eventData = await formatUserBidShow({
      seatIndex: playerObj.seatIndex,
      bid,
    });

    // send User Bid Show Socket Event
    CommonEventEmitter.emit(EVENTS.USER_BID_SHOW_SOCKET_EVENT, {
      tableId: tableId.toString(),
      data: eventData,
    });

    if (ack) {
      socketAck.ackMid(
        EVENTS.USER_BID_SOCKET_EVENT,
        {
          success: true,
          error: null,
          tableId,
        },
        // socket.metrics,
        socket.userId,
        tableId,
        ack,
      );
    }

    /* check all bid done */
    const playerSeats = roundObj.seats;
    const playerGamePlaydata = await Promise.all(
      Object.keys(playerSeats).map(async (ele) =>
        getPlayerGamePlay(playerSeats[ele].userId, tableId)
      )
    );
    logger.info(tableId, 'setBid : playerGamePlaydata ', playerGamePlaydata);


    const bidTurnComplete = playerGamePlaydata.every(player => player.bidTurn);
    logger.info(tableId, 'setBid : bidTurnComplete ', bidTurnComplete);

    // Bid Turn is Complete
    const nextTurn = roundObj.currentTurn;
    logger.info(tableId, ' setBid : nextTurn : ==>>', nextTurn);

    if (bidTurnComplete) {

      await Scheduler.cancelJob.playerBidTurnTimerCancel(`${tableId}:${currentRound}`);

      roundObj.lastInitiater = nextTurn;
      roundObj.tableState = TABLE_STATE.ROUND_STARTED;
      const nextTurnPlayerData: playerPlayingDataIf = await getPlayerGamePlay(
        nextTurn,
        tableId
      );
      nextTurnPlayerData.isTurn = true;
      await setPlayerGamePlay(nextTurn, tableId, nextTurnPlayerData);
      await setRoundTableData(tableId, currentRound, roundObj);

      // set Scheduler of Card throw Turn Start
      await Scheduler.addJob.initialTurnSetupTimer({
        timer: NUMERICAL.ZERO * NUMERICAL.FIVE_HUNDRED,
        jobId: `${tableId}:${playingTable.currentRound}`,
        tableData: playingTable,
        playerGamePlayData: playerGamePlaydata,
        nextTurn,
      });

    }

    // Change Player Bid Turn
    // changeTurn(tableId.toString());
  } catch (error: any) {
    logger.error(
      tableId, `CATCH_ERROR : setBid Error : tableId: ${tableId} :: userId: ${userId} :: bid: ${bid} :: `,
      error,
    );

    if (error instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: error,
      });
    } else if (error && error.type === ERROR_TYPE.USER_BID_ERROR) {
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
        EVENTS.USER_BID_SOCKET_EVENT,
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
    await getLock.release(setBidLock);
  }
}

export = setBid;
