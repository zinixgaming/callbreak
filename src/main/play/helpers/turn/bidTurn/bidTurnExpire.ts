import logger from '../../../../logger';
import {
  getPlayerGamePlay,
  setPlayerGamePlay,
  getRoundTableData,
  setRoundTableData,
  getTableData,
} from '../../../../gameTable/utils';
import {EVENTS, NUMERICAL, TABLE_STATE} from '../../../../../constants';
import CommonEventEmitter from '../../../../commonEventEmitter';
import Scheduler from '../../../../scheduler';
import changeTurn from './changeTurn';
import {playerPlayingDataIf} from '../../../../interface/playerPlayingTableIf';
import {playingTableIf} from '../../../../interface/playingTableIf';
import {roundTableIf} from '../../../../interface/roundTableIf';
import cancelBattle from '../../../cancelBattle';
import Errors from '../../../../errors';
import {formatUserBidShow} from '../../playHelper';
import {getRandomNumber} from '../../../../FTUE/common';
import {calculateBotBid} from '../../../../playBot/utils';

// call this function on Bid Turn Timer Expire
async function setBidOnTurnExpire(tableData: playingTableIf) {
  const {_id: tableId, currentRound, isFTUE} = tableData;
  const {getLock} = global;
  const setBidOnTurnExpireLock = await getLock.acquire([tableId], 2000);
  try {
    // Bid calculation will be done per player based on their cards
    logger.info(tableId, 'setBidOnTurnExpire : Expire Bid Turn ');
    // Cancel Bid Turn Timer Scheduler
    await Scheduler.cancelJob.playerBidTurnTimerCancel(
      `${tableId}:${currentRound}`,
    );

    const playTable: playingTableIf = await getTableData(tableId);
    const roundPlayingTable = await getRoundTableData(tableId, currentRound);
    logger.info(' setBidOnTurnExpire :: playTable :: ==>> ', playTable);
    logger.info(
      ' setBidOnTurnExpire :: roundPlayingTable :: ==>> ',
      roundPlayingTable,
    );

    const playerSeats = roundPlayingTable.seats;
    const playersPlayingData = await Promise.all(
      Object.keys(playerSeats).map(async ele =>
        getPlayerGamePlay(playerSeats[ele].userId, tableId),
      ),
    );

    for (let i = 0; i < playersPlayingData.length; i++) {
      const player = playersPlayingData[i];
      logger.info(' player :;: ==>> ', player);

      if (!player.bidTurn && player.bid == NUMERICAL.ZERO) {
        // Calculate bid based on player's cards using intelligent bot logic
        let bid = 1; // default bid
        if (isFTUE) {
          // For FTUE mode, still use random for simplicity, but you can change this
          bid = getRandomNumber(1, 4);
        } else {
          // Use intelligent bid calculation based on player's current cards
          bid = player.isBot ? calculateBotBid(player.currentCards) : 1;
        }

        player.bid = bid;
        player.bidTurn = true;

        await setPlayerGamePlay(player.userId, tableId, player);

        // TODO:: reaminning validation
        const eventData = await formatUserBidShow({
          seatIndex: player.seatIndex,
          bid,
        });

        // send USER_BID_SHOW Socket Event in turn expire
        CommonEventEmitter.emit(EVENTS.USER_BID_SHOW_SOCKET_EVENT, {
          tableId: tableId.toString(),
          data: eventData,
        });
      }
    }

    /* check all bid select done */
    const playerGamePlaydata = await Promise.all(
      Object.keys(playerSeats).map(async ele =>
        getPlayerGamePlay(playerSeats[ele].userId, tableId),
      ),
    );

    const bidTurnComplete = playerGamePlaydata.every(player => player.bidTurn);
    logger.info(
      tableId,
      'setBidOnTurnExpire : bidTurnComplete ',
      bidTurnComplete,
    );

    // Bid Turn is Complete
    const nextTurn = roundPlayingTable.currentTurn;
    logger.info(tableId, 'setBidOnTurnExpire : nextTurn ', nextTurn);

    if (bidTurnComplete) {
      roundPlayingTable.lastInitiater = nextTurn;
      roundPlayingTable.tableState = TABLE_STATE.ROUND_STARTED;
      const nextTurnPlayerData: playerPlayingDataIf = await getPlayerGamePlay(
        nextTurn,
        tableId,
      );
      nextTurnPlayerData.isTurn = true;
      await setPlayerGamePlay(nextTurn, tableId, nextTurnPlayerData);
      await setRoundTableData(tableId, currentRound, roundPlayingTable);

      // set Scheduler of Card throw Turn Start
      await Scheduler.addJob.initialTurnSetupTimer({
        timer: NUMERICAL.ZERO * NUMERICAL.FIVE_HUNDRED,
        jobId: `${tableId}:${playTable.currentRound}`,
        tableData: playTable,
        playerGamePlayData: playerGamePlaydata,
        nextTurn,
      });
    }

    // Change Player Bid Turn
    // changeTurn(tableId.toString());
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : setBidOnTurnExpire :: tableId:${tableId} :: currentRound: ${currentRound}`,
      e,
    );
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    logger.info(tableId, 'setBidOnTurnExpire : Lock : ', tableId);
    await getLock.release(setBidOnTurnExpireLock);
  }
}

export = setBidOnTurnExpire;
