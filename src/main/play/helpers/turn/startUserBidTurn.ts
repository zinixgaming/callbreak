import logger from '../../../logger';
import Scheduler from '../../../scheduler';
import {formatStartUserBidTurn} from '../playHelper';
import {
  ERROR_TYPE,
  EVENTS,
  MESSAGES,
  NUMERICAL,
  TABLE_STATE,
} from '../../../../constants';
import CommonEventEmitter from '../../../commonEventEmitter';
import {
  getRoundTableData,
  setRoundTableData,
  getPlayerGamePlay,
} from '../../../gameTable/utils';
import {playingTableIf} from '../../../interface/playingTableIf';
import {playerPlayingDataIf} from '../../../interface/playerPlayingTableIf';
import {roundTableIf} from '../../../interface/roundTableIf';
import cancelBattle from '../../cancelBattle';
import Errors from '../../../errors';
import {throwErrorIF} from '../../../interface/throwError';
import startRound from '../../startRound';

// manage Player Bid Turn Timer
async function startUserBidTurn(
  tableData: playingTableIf,
  playerGamePlays: playerPlayingDataIf[],
  nextTurn: string,
  dealerIndex: number,
  dealerId: string,
): Promise<boolean | any> {
  logger.debug(tableData._id, 'startUserBidTurn : tableData :: ', tableData);
  logger.info(
    tableData._id,
    'startUserBidTurn : playerGamePlays :: ',
    playerGamePlays,
    ' : nextTurn :: ',
    nextTurn,
  );

  const {_id: tableId, isFTUE} = tableData;
  const {getLock} = global;
  const startUserBidTurnLock = await getLock.acquire([tableId], 2000);
  try {
    // resuffle cards
    const usersCards: Array<Array<string>> = [];
    for (let i = 0; i < playerGamePlays.length; i++) {
      const ele: playerPlayingDataIf = playerGamePlays[i];
      usersCards.push(ele.currentCards);
    }
    logger.info(tableId, 'usersCards :>> ', usersCards);

    let userCountInSpadeExist: number = NUMERICAL.ZERO;
    userCountInSpadeExist = await checkSpadesCards(usersCards);
    logger.info(tableId, 'userCountInSpadeExist ==>>', userCountInSpadeExist);

    if (userCountInSpadeExist !== usersCards.length) {
      let counter = NUMERICAL.ONE;
      logger.info(tableId, '<<== Resuffle call ==>>');
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        tableId,
        data: {
          isPopup: false,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
          message: MESSAGES.ERROR.RESUFFUL_YOUR_CARDS,
        },
      });
      counter += 1;
      const roundTableData = await getRoundTableData(tableId, NUMERICAL.ONE);
      const data = {
        timer: (NUMERICAL.FOUR + NUMERICAL.ONE) * NUMERICAL.THOUSAND,
        jobId: tableId,
        tableId,
        tableData: tableData,
        roundTableData: roundTableData,
      };

      CommonEventEmitter.emit(EVENTS.RESUFFLE_CARDS, {
        data,
        counter,
        nextTurn,
        dealerIndex,
        dealerId,
      });

      return false;
    }

    if (playerGamePlays.length <= 1) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.START_BID_ERROR,
        message: MESSAGES.ERROR.USER_DETAIL_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }
    // throw new Error('startUserTurn :: Error: "playingTableData not found!!!"');

    const playerGamePlay = playerGamePlays.filter(
      (e: playerPlayingDataIf) => e.userId === nextTurn,
    )[0];

    const resolvedPromise = await Promise.all([
      getRoundTableData(tableId, tableData.currentRound),
      getPlayerGamePlay(playerGamePlay.userId, tableId),
    ]);

    const tableGameData: roundTableIf = resolvedPromise[0];
    const userProfile: playerPlayingDataIf = resolvedPromise[1];

    logger.info(
      tableId,
      'startUserBidTurn : tableGameData :: ',
      tableGameData,
      ' : userProfile :: ',
      userProfile,
      ' : tableGameData : 3334454 :: ',
      typeof tableGameData.seats,
      typeof tableGameData,
    );

    tableGameData.currentTurn = playerGamePlay.userId;
    tableGameData.tableState = TABLE_STATE.BID_ROUND_STARTED;
    tableGameData.currentPlayerInTable = Object.keys(
      tableGameData.seats,
    ).filter(ele => tableGameData.seats[ele].userId).length;

    const seatIndexList: number[] = Object.keys(tableGameData.seats)
      .filter(key =>
        Object.prototype.hasOwnProperty.call(
          tableGameData.seats[key],
          'seatIndex',
        ),
      )
      .map(key => tableGameData.seats[key].seatIndex);

    logger.info('startUserBidTurn :: seatIndexList :: ', seatIndexList);

    tableGameData.tableCurrentTimer = Number(
      new Date(),
    ) /*+ NUMERICAL.FOUR * NUMERICAL.THOUSAND*/;

    await Promise.all([
      setRoundTableData(tableId, tableData.currentRound, tableGameData),
    ]);

    const eventBidTurnData = await formatStartUserBidTurn(
      tableData,
      seatIndexList,
    );

    // send User Bid Turn Started Socket Event
    CommonEventEmitter.emit(EVENTS.USER_BID_TURN_STARTED_SOCKET_EVENT, {
      tableId: tableId.toString(),
      data: eventBidTurnData,
    });

    /**
     * start Bid Turn Timer
     * need to restart turn timer sechduler
     */
    logger.info(tableId, 'startUserBidTurn : Bid turn timer started -->>>>>');
    if (userProfile.isBot) {
      logger.info('startUserBidTurn :: bot bit turn timer schedul ::');
      // send bot for auto turn
      await Scheduler.addJob.botBidTurnTimer({
        timer: NUMERICAL.TWO * NUMERICAL.THOUSAND,
        jobId: `${playerGamePlay.userId}-${tableId}-${tableData.currentRound}`,
        playerGamePlay,
        tableData,
      });
    } else {
      await Scheduler.addJob.playerBidTurnTimer({
        timer: (tableData.userTurnTimer + NUMERICAL.ONE) * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${tableData.currentRound}`,
        tableData,
      });
    }

    // if (!isFTUE) {
    //   // normal playing
    //     if(playerGamePlay.isLeft){

    //       await Scheduler.addJob.playerBidTurnTimer({
    //         timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
    //         jobId: `${tableId}:${tableData.currentRound}`,
    //         tableData,
    //       });

    //     }else{
    //       await Scheduler.addJob.playerBidTurnTimer({
    //         timer: (tableData.userTurnTimer + NUMERICAL.ONE) * NUMERICAL.THOUSAND,
    //         jobId: `${tableId}:${tableData.currentRound}`,
    //         tableData,
    //       });
    //     }
    // } else if (playerGamePlay.seatIndex !== NUMERICAL.ZERO) {
    //   /**
    //    * FTUE Playing
    //    * not set bid Scheduler for real user
    //    */

    //   await Scheduler.addJob.playerBidTurnTimer({
    //     timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
    //     jobId: `${tableId}:${tableData.currentRound}`,
    //     tableData,
    //   });
    // }
  } catch (error: any) {
    logger.error(
      tableId,
      `CATCH_ERROR : startUserBidTurn : tableId: ${tableId} :: userId: ${nextTurn} :: `,
      error,
    );
    if (error instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: error,
      });
    } else if (error && error.type === ERROR_TYPE.START_BID_ERROR) {
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        tableId,
        data: {
          isPopup: false,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.TOAST_POPUP,
          message: error.message,
        },
      });
    }
  } finally {
    await getLock.release(startUserBidTurnLock);
  }
}

function checkSpadesCards(usersCards: Array<Array<string>>) {
  const spade = 'S';
  let userCardsInSpadeExist = 0;
  for (let index = 0; index < usersCards.length; index++) {
    const cards = usersCards[index];
    for (let i = 0; i < cards.length; i++) {
      const val = cards[i];
      const isCard = val.includes(spade);
      if (isCard) {
        userCardsInSpadeExist += 1;
        break;
      }
    }
  }
  return userCardsInSpadeExist;
}

function checkSpadesAndLowCards(usersCards: Array<Array<string>>) {
  let count = 0;

  for (let index = 0; index < usersCards.length; index++) {
    const cards = usersCards[index];
    for (let i = 0; i < cards.length; i++) {
      const val = cards[i];

      // Split the card into suit and rank
      const [suit, rankStr] = val.split('-');
      const rank = parseInt(rankStr);
      // Check if the card is a spade or if the rank is less than or equal to 10
      if (rank && rank <= 10) {
        count += 1;
        break;
      }
    }
  }
}

export = startUserBidTurn;
