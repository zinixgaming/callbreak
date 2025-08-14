import logger from '../../logger';
import {
  getPlayerGamePlay,
  setPlayerGamePlay,
  getRoundTableData,
  setRoundTableData,
} from '../../gameTable/utils';
import { EVENTS } from '../../../constants';
import CommonEventEmitter from '../../commonEventEmitter';
import Scheduler from '../../scheduler';
import changeTurn from '../../play/helpers/turn/bidTurn/changeTurn';
import { playerPlayingDataIf } from '../../interface/playerPlayingTableIf';
import { playingTableIf } from '../../interface/playingTableIf';
import { roundTableIf } from '../../interface/roundTableIf';
import cancelBattle from '../../play/cancelBattle';
import Errors from '../../errors';
import { formatUserBidShow } from '../../play/helpers/playHelper';
import { getRandomNumber } from '../common';

// call this function on Bid Turn For Bot in FTUE
async function bidTurnForBot(
  playerGamePlay: playerPlayingDataIf,
  tableData: playingTableIf,
) {
  const { userId } = playerGamePlay;
  const { _id: tableId, currentRound } = tableData;
  const { getLock } = global;
  const bidTurnForBotLock = await getLock.acquire([tableId], 2000);
  try {
    const bid = await getRandomNumber(1, 3);

    logger.info('bidTurnForBot : Expire Bid Turn ');
    // Cancel Bid Turn Timer Scheduler
    await Scheduler.cancelJob.playerBidTurnTimerCancel(
      `${userId}:${tableId}:${currentRound}`,
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
      `CATCH_ERROR : bidTurnForBot :: tableId:${tableId} :: userId: ${userId} :: currentRound: ${currentRound}`,
      e,
    );
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    logger.info('bidTurnForBot : Lock : ', tableId);
    await getLock.release(bidTurnForBotLock);
  }
}

export = bidTurnForBot;
