import logger from '../../../../logger';
import {
  getPlayerGamePlay,
  setPlayerGamePlay,
  getRoundTableData,
  setRoundTableData,
  getTableData,
} from '../../../../gameTable/utils';
import {
  EVENTS,
  HISTORY,
  CARD_SEQUENCE,
  TABLE_STATE,
  MESSAGES,
  ERROR_TYPE,
} from '../../../../../constants';
import CommonEventEmitter from '../../../../commonEventEmitter';
import Scheduler from '../../../../scheduler';
import changeThrowCardTurn from '../changeThrowCardTurn';
import { playerPlayingDataIf } from '../../../../interface/playerPlayingTableIf';
import { playingTableIf } from '../../../../interface/playingTableIf';
import { roundTableIf } from '../../../../interface/roundTableIf';
import { throwErrorIF } from '../../../../interface/throwError';
import socketAck from '../../../../../socketAck';
import cancelBattle from '../../../cancelBattle';
import Errors from '../../../../errors';
import { cardThrowRequestIf } from '../../../../interface/requestIf';
import { updateTurnHistory } from '../../../history';
import { formantUserThrowCardShowIf } from '../../../../interface/responseIf';
import { formatUserThrowCardShow } from '../../playHelper';
import { getCardNumber } from './utile';

// User Card Throw on Board
async function cardThrow(
  data: cardThrowRequestIf,
  socket: any,
  ack?: Function,
) {
  logger.debug('cardThrow : info :: ', data);
  const { card } = data;
  const { tableId, userId } = socket.eventMetaData;
  const { getLock } = global;
  let cardThrowLock = await getLock.acquire([`cardThrow:${tableId}`], 2000);
  try {
    const playingTable: playingTableIf = await getTableData(tableId);
    if (!playingTable) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.TABLE_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }
    const { currentRound } = playingTable;

    const promises = await Promise.all([
      getPlayerGamePlay(userId, tableId),
      getRoundTableData(tableId, currentRound),
    ]);

    const playerObj: playerPlayingDataIf = promises[0];
    const roundObj: roundTableIf = promises[1];

    if (roundObj.tableState === TABLE_STATE.SCOREBOARD_DECLARED) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.DECLARED_WINNER_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    logger.info(
      'cardThrow : playerObj :: ',
      playerObj,
      '  : roundObj :: ',
      roundObj,
    );

    if (roundObj.currentTurn !== userId || !playerObj.isTurn) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.CURRENT_TURN_IS_NOT_YOUR_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    const userCards: Array<string> = [...playerObj.currentCards];
    // const userCardsForcheck: Array<string> = [...playerObj.currentCards];
    const cardIndex = userCards.indexOf(card);

    if (cardIndex === -1) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.CURRENT_CARD_IS_NOT_YOUR_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    const roundCurrentCards = [...roundObj.turnCurrentCards];
    roundCurrentCards.sort((a, b) => {
      const cardA =
        Number(a.split('-')[1]) === 1 &&
        a.split('-')[0] === roundObj.turnCardSequence
          ? 14
          : a.split('-')[0] === roundObj.turnCardSequence
          ? Number(a.split('-')[1])
          : 0;
      const cardB =
        Number(b.split('-')[1]) === 1 &&
        b.split('-')[0] === roundObj.turnCardSequence
          ? 14
          : b.split('-')[0] === roundObj.turnCardSequence
          ? Number(b.split('-')[1])
          : 0;
      return cardB - cardA;
    });

    const currentHightCard = roundCurrentCards[0];
    logger.info(`currentHightCard ::: ${currentHightCard}`);

    const cardSequence = card.split('-')[0];
    let SeaquebceCard: number = 0;

    // check in my card have a same sequence card or not
    const SeaquebceCardCheck: string | undefined = userCards.find(
      (fcard: string) => {
        return fcard.charAt(0) === roundObj.turnCardSequence;
      },
    );
    if (typeof SeaquebceCardCheck === 'undefined') SeaquebceCard = 0;
    else SeaquebceCard = 1;

    logger.info(
      `SeaquebceCardCheck ::: ${SeaquebceCardCheck} ::: SeaquebceCard :: ${SeaquebceCard}`,
    );

    let isHighCard: number = 0;
    // check hight card are avalible or not in card
    const hightCardCheck: string[] = userCards
      .map((fcard: string) => {
        const my = getCardNumber(fcard);
        const cmy = getCardNumber(currentHightCard);
        if (fcard.split('-')[0] === roundObj.turnCardSequence && my > cmy)
          return fcard;
        else return '';
      })
      .filter((e: string) => e);

    if (hightCardCheck.length === 0) isHighCard = 0;
    else isHighCard = 1;

    logger.info(
      `hightCardCheck ::: ${hightCardCheck} ::: isHighCard :: ${isHighCard}`,
    );

    // check Spades Card have or not
    const spadesCardCheck: string | undefined = userCards.find(
      (fcard: string) => {
        return fcard.charAt(0) === CARD_SEQUENCE.CARD_SPADES;
      },
    );

    logger.info(`spadesCardCheck ::: ${spadesCardCheck} `);
    // same sequence
    if (
      roundObj.turnCardSequence !== CARD_SEQUENCE.CARD_NONE &&
      // !roundObj.breakingSpades &&
      cardSequence !== roundObj.turnCardSequence &&
      SeaquebceCard
    ) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.USER_THROW_CARD_ERROR,
        message: MESSAGES.ERROR.DONT_THROW_OTHER_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    // hight card
    // if (
    //   roundObj.turnCardSequence !== CARD_SEQUENCE.CARD_NONE &&
    //   cardSequence === roundObj.turnCardSequence &&
    //   isHighCard &&
    //   getCardNumber(card) < getCardNumber(hightCardCheck[0])
    // ) {
    //   const errorObj: throwErrorIF = {
    //     type: ERROR_TYPE.USER_THROW_CARD_ERROR,
    //     message: MESSAGES.ERROR.THROW_THE_HIGHT_CARD_ERROR_MESSAGES,
    //     isToastPopup: true,
    //   };
    //   throw errorObj;
    // }
    

    // spades card
    // if (
    //   roundObj.turnCardSequence !== CARD_SEQUENCE.CARD_NONE &&
    //   !isHighCard &&
    //   !SeaquebceCard &&
    //   typeof spadesCardCheck !== 'undefined' &&
    //   cardSequence !== CARD_SEQUENCE.CARD_SPADES
    // ) {
    //   const errorObj: throwErrorIF = {
    //     type: ERROR_TYPE.USER_THROW_CARD_ERROR,
    //     message: MESSAGES.ERROR.THROW_THE_SPADES_CARD_ERROR_MESSAGES,
    //     isToastPopup: true,
    //   };
    //   throw errorObj;
    // }

    // Cancel Turn Timer Scheduler
    await Scheduler.cancelJob.playerTurnTimerCancel(
      `${userId}:${tableId}:${currentRound}`,
    );

    playerObj.isTurn = false;
    await setPlayerGamePlay(userId, tableId, playerObj);
    logger.info(
      'cardThrow : roundObj.turnCardSequence :: ',
      roundObj.turnCardSequence,
    );
    if (roundObj.turnCardSequence === CARD_SEQUENCE.CARD_NONE) {
      roundObj.turnCardSequence = cardSequence;
    }
    if (
      !roundObj.breakingSpades &&
      cardSequence === CARD_SEQUENCE.CARD_SPADES
    ) {
      roundObj.breakingSpades = true;
    }

    logger.info(
      'cardThrow : (cardSequence === roundObj.turnCardSequence || SeaquebceCard === 0) ::: ',
      cardSequence === roundObj.turnCardSequence || SeaquebceCard === 0,
      'cardThrow : cardSequence :: ',
      cardSequence,
      'cardThrow : roundObj.turnCardSequence :: ',
      roundObj.turnCardSequence,
      'cardThrow : SeaquebceCard :: ',
      SeaquebceCard,
    );

    if (cardSequence === roundObj.turnCardSequence || SeaquebceCard === 0) {
      playerObj.currentCards.splice(cardIndex, 1);
      /*
      update Turn History
     */
      await updateTurnHistory(
        tableId,
        currentRound,
        playerObj,
        HISTORY.CARD_THROW_TURN,
        card,
        playerObj.currentCards,
      );

      playerObj.currentCards = playerObj.currentCards;

      const turnCards = roundObj.turnCurrentCards;
      turnCards.splice(playerObj.seatIndex, 1, card);
      roundObj.turnCurrentCards = turnCards;
    }

    playerObj.isTurn = false;
    playerObj.turnTimeout = 0;
    await Promise.all([
      setPlayerGamePlay(userId, tableId, playerObj),
      setRoundTableData(tableId, currentRound, roundObj),
    ]);

    const eventData: formantUserThrowCardShowIf = await formatUserThrowCardShow(
      {
        seatIndex: playerObj.seatIndex,
        card,
        breakingSpades: roundObj.breakingSpades,
        turnTimeout: false,
      },
    );

    // send User Throw Card Show Socket Event
    CommonEventEmitter.emit(EVENTS.USER_THROW_CARD_SHOW_SOCKET_EVENT, {
      tableId: tableId.toString(),
      data: eventData,
    });

    if (ack) {
      socketAck.ackMid(
        EVENTS.USER_THROW_CARD_SOCKET_EVENT,
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
    changeThrowCardTurn(tableId.toString());
  } catch (error: any) {
    logger.error(
      `CATCH_ERROR : cardThrow Turn : tableId: ${tableId} :: userId: ${userId} :: card: ${card} :: `,
      error,
    );

    if (error instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: error,
      });
    } else if (error && error.type === ERROR_TYPE.USER_THROW_CARD_ERROR) {
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
        EVENTS.USER_THROW_CARD_SOCKET_EVENT,
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
    if(cardThrowLock){
      await getLock.release(cardThrowLock);
    }
  }
}

export = cardThrow;
