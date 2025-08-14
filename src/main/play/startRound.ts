import _ from 'underscore';
import logger from '../logger';
import {
  EMPTY,
  EVENTS,
  INSTRUMENTATION_EVENTS,
  MESSAGES,
  NUMERICAL,
  TABLE_STATE,
} from '../../constants';
import {INITIAL_BID_TURN_SETUP_TIMER_EXPIRED} from '../../constants/eventEmitter';
import {startUserBidTurn, chooseDealer} from './helpers';
import {getUserByObjectId} from '../signUp/userProfile';
import {getNextPlayer} from '../common';
import distributeCards from './helpers/distributeCards';
import CommonEventEmitter from '../commonEventEmitter';
import {updateCardsByRoundId} from '../playerGamePlay';
import {formatCardDistribution} from './helpers/playHelper';
import Scheduler from '../scheduler';
import {
  getPlayerGamePlay,
  getUser,
  setPlayerGamePlay,
  setUser,
  updateRoundTableData,
} from '../gameTable/utils';
import {playerPlayingDataIf} from '../interface/playerPlayingTableIf';
import {roundStartTimerIf} from '../interface/schedulerIf';
import {eventDataIf} from '../interface/startRoundIf';
import cancelBattle from './cancelBattle';
import Errors from '../errors';
import {addTurnHistory} from './history';

/**
 * start round for players
 */
async function startRound(
  data: roundStartTimerIf,
  counter: number = 1,
  nextTurn: string = EMPTY,
  dealerIndex: number = NUMERICAL.ZERO,
  dealerId: string = EMPTY,
) {
  logger.debug('startRound : data :: ', data);
  const {roundTableData, tableData} = data;
  const tableId = tableData._id;
  const {getLock} = global;
  const startRoundLock = await getLock.acquire([tableId], 2000);
  try {
    const {seats} = roundTableData;
    const {currentRound} = tableData;

    logger.info(
      tableId,
      'counter :',
      counter,
      'currentRound :: ',
      currentRound,
    );
    logger.info(
      tableId,
      'nextTurn :',
      nextTurn,
      'dealerIndex :: ',
      dealerIndex,
      'dealerId :: ',
      dealerId,
    );

    const promises: playerPlayingDataIf[] = await Promise.all(
      Object.keys(seats).map(async key =>
        getUserByObjectId(tableId, seats[key].userId),
      ),
    );

    if (counter === 1) {
      const dealerData = await chooseDealer(
        seats,
        roundTableData.dealerPlayer,
        tableData.isFTUE,
      );
      dealerId = dealerData.dealerId;
      dealerIndex = dealerData.dealerIndex;
      logger.info('startRound : dealerId :: ', dealerId);
      logger.info('startRound : promises :: ', promises);
      let dealerObj: playerPlayingDataIf[] | playerPlayingDataIf =
        promises.filter(user => user.userId === dealerId);
      logger.info('startRound : dealerObj :: ', dealerObj);
      if (Array.isArray(dealerObj)) dealerObj = dealerObj[0];
      logger.info('startRound : dealerObj : 111 :: ', dealerObj);
      nextTurn = await getNextPlayer(seats, dealerObj.userId);

      const nextTurnPlayerInfo: playerPlayingDataIf[] = promises.filter(
        user => user.userId === nextTurn,
      );
      logger.info('startRound : nextTurnPlayerInfo :: ', nextTurnPlayerInfo);

      nextTurnPlayerInfo[0].isFirstTurn = true;

      logger.info(
        nextTurn,
        ' : startRound : nextTurnPlayerInfo :: ',
        nextTurnPlayerInfo,
      );
      await setPlayerGamePlay(nextTurn, tableId, nextTurnPlayerInfo[0]);
      const playersData = promises;
      const usersCards = await distributeCards(
        playersData,
        tableData.isFTUE,
        counter,
      );
      logger.info('usersCards : =>> ', usersCards);

      await updateRoundTableData(
        roundTableData,
        {
          dealerPlayer: dealerId,
          tableState: TABLE_STATE.START_DEALING_CARD,
          potValue: tableData.bootValue * roundTableData.seats.length,
        },
        {currentRound, tableId},
      );
    }

    const playersData = promises;
    const usersCards = await distributeCards(
      playersData,
      tableData.isFTUE,
      counter,
    );
    logger.info(tableId, 'usersCards : =>> ', usersCards);

    // RETURNS ARRAY containing playerGamePlay data
    const playerGamePlayData = await updateCardsByRoundId(
      seats,
      usersCards,
      tableId,
    );
    /**
     * this function moves the dealer to index 0 in array while keeping the order
     */

    const eventData: eventDataIf = {
      usersCards,
      playersData,
      dealerId: dealerIndex,
      seatIndex: -1,
      currentRound,
    };

    for (let i = 0; i < playersData.length; ++i) {
      const player = playersData[i];
      eventData.seatIndex = i;

      // if (!tableData.isFTUE) {
      //   // instrumentation call
      //   CommonEventEmitter.emit(
      //     INSTRUMENTATION_EVENTS.USER_SPADES_ROUND_STARTED,
      //     {
      //       tableData,
      //       tableGamePlay: roundTableData,
      //       userData: playersData[i],
      //     },
      //   );
      // }

      // Send Show My Card Event
      logger.info(tableId, 'startRound : player :: ', player);
      const formattedData = await formatCardDistribution(eventData);

      // const userDetail = await getUser(playersData[i].userId)
      // logger.info(tableId, "startRound : userDetail get :: ", userDetail);

      // const updatedUserQuery = {
      //   ...userDetail,
      //   card: formattedData.cards
      // }
      // logger.info(tableId, "updatedUserQuery get :: ", updatedUserQuery);

      // await setUser(userDetail.userId, updatedUserQuery)
      CommonEventEmitter.emit(EVENTS.SHOW_MY_CARDS_SOCKET_EVENT, {
        socket: player.socketId,
        data: formattedData,
      });
    }

    logger.info(
      tableId,
      'startRound : tableData :: ',
      tableData,
      ' playerGamePlayData :: ',
      playerGamePlayData,
      ' nextTurn :: ',
      nextTurn,
    );

    /*
      add Turn History forment
    */
    if (counter === 1) {
      await addTurnHistory(tableId, roundTableData);
    }

    if (!tableData.isFTUE) {
      /* 
    scheduling 10 sec timer for start bid Turn 
    */
      await Scheduler.addJob.initialBidTurnSetupTimer({
        timer: NUMERICAL.FOUR * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${tableData.currentRound}`,
        tableData,
        playerGamePlayData,
        nextTurn,
        dealerIndex,
        dealerId,
      });
    }
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : startRound :: tableId: ${tableId} :: roundID: ${roundTableData._id} :`,
      e,
    );
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    await getLock.release(startRoundLock);
  }
}

// get from Scheduler after timer complete
CommonEventEmitter.on(INITIAL_BID_TURN_SETUP_TIMER_EXPIRED, (res: any) => {
  logger.info('call on INITIAL_BID_TURN_SETUP_TIMER_EXPIRED.', res);

  startUserBidTurn(
    res.tableData,
    res.playerGamePlayData,
    res.nextTurn,
    res.dealerIndex,
    res.dealerId,
  );
});
/**
 * exported functions
 */
export = startRound;
