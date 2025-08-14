import { EVENTS, EVENT_EMITTER } from '../../../constants';
import CommonEventEmitter from '../../commonEventEmitter';
import { getRandomNumber } from '../../FTUE/common';
import {
  getPlayerGamePlay,
  getRoundTableData,
  setPlayerGamePlay,
  setRoundTableData,
} from '../../gameTable/utils';
import { playerPlayingDataIf } from '../../interface/playerPlayingTableIf';
import { playingTableIf } from '../../interface/playingTableIf';
import { roundTableIf } from '../../interface/roundTableIf';
import logger from '../../logger';
import { formatUserBidShow } from '../../play/helpers/playHelper';
import changeTurn from '../../play/helpers/turn/bidTurn/changeTurn';
import Scheduler from '../../scheduler';

async function botBidTurn(
  playerGamePlay: playerPlayingDataIf,
  tableData: playingTableIf,
) {
  const { userId } = playerGamePlay;
  const { _id: tableId, currentRound } = tableData;
  const { getLock, getConfigData: config } = global;
  const botBetBidLock = await getLock.acquire([tableId], 2000);

  try {
    const bid = await getRandomNumber(1, 4);

    // Cancel Bid Turn Timer Scheduler
    await Scheduler.cancelJob.playerBidTurnTimerCancel(
      `${userId}-${tableId}-${currentRound}`,
    );

    const promises = await Promise.all([
      getPlayerGamePlay(userId, tableId),
      getRoundTableData(tableId, currentRound),
    ]);

    const playerObj: playerPlayingDataIf = promises[0];
    const roundObj: roundTableIf = promises[1];

    playerObj.bid = bid;
    playerObj.bidTurn = true;

    //if Current Turn is Your
    if (roundObj.currentTurn !== userId)
      throw new Error('current turn is not your turn !');

    await Promise.all([
      setPlayerGamePlay(userId, tableId, playerObj),
      setRoundTableData(tableId, currentRound, roundObj),
    ]);

    // TODO:: reaminning validation
    const eventData = await formatUserBidShow({
      seatIndex: playerObj.seatIndex,
      bid,
    });

    // send USER_BID_SHOW Socket Event in turn expire
    CommonEventEmitter.emit(EVENTS.USER_BID_SHOW_SOCKET_EVENT, {
      tableId: tableId.toString(),
      data: eventData,
    });

    // Change Player Bid Turn
    changeTurn(tableId.toString());
  } catch (e) {
    logger.error(
      `CATCH_ERROR : botBidTurn :: tableId:${tableId} :: userId: ${userId} :: currentRound: ${currentRound}`,
      e,
    );
  } finally {
    logger.info('botBidTurn : Lock : ', tableId);
    await getLock.release(botBetBidLock);
  }
}

export = botBidTurn;
