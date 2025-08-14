/* eslint-disable prefer-destructuring */
export = cardThrowTurnExpire;
import logger from '../../../../logger';
import CommonEventEmitter from '../../../../commonEventEmitter';
import Scheduler from '../../../../scheduler';
import { getConfig } from '../../../../../config';
const { TIME_OUT_COUNT } = getConfig();
import {
  getPlayerGamePlay,
  setPlayerGamePlay,
  getRoundTableData,
  setRoundTableData,
} from '../../../../gameTable/utils';
import {
  EVENTS,
  CARD_SEQUENCE,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
  HISTORY,
} from '../../../../../constants';
import changeThrowCardTurn from '../changeThrowCardTurn';
import { playerPlayingDataIf } from '../../../../interface/playerPlayingTableIf';
import { playingTableIf } from '../../../../interface/playingTableIf';
import { roundTableIf } from '../../../../interface/roundTableIf';
import cancelBattle from '../../../cancelBattle';
import Errors from '../../../../errors';
import { updateTurnHistory } from '../../../history';
import { formatUserThrowCardShow } from '../../playHelper';
import { userThrowCardTips } from '../../../../FTUE/common';
import { getCardNumber } from './utile';

// mange Player is not tack a turn (Auto Turn)
async function cardThrowTurnExpire(
  playerGamePlay: playerPlayingDataIf,
  tableData: playingTableIf,
  isAutoMode:boolean = false
) {
  const { userId } = playerGamePlay;
  const { _id: tableId, currentRound, isFTUE } = tableData;
  const { getLock } = global;
  let cardThrowTurnExpireLock = await getLock.acquire([`cardThrowTurn:${tableId}`], 2000);
  try {
    logger.info(
      `cardThrowTurnExpire : tableId :: ${tableId} :: userId: ${userId} :: isAutoMode ::  ${isAutoMode}`,
    );

    const promises = await Promise.all([
      getPlayerGamePlay(userId, tableId),
      getRoundTableData(tableId, currentRound),
    ]);

    const playerObj: playerPlayingDataIf = promises[0];
    const roundObj: roundTableIf = promises[1];

    if (roundObj.tableState === TABLE_STATE.SCOREBOARD_DECLARED)
      throw new Error('This Table Declared Winner');
    logger.info(
      'cardThrowTurnExpire : playerObj.turnTimeout ::: ',
      playerObj.turnTimeout,
      ' : cardThrowTurnExpire : NUMERICAL.TWO ::: ',
      NUMERICAL.TWO,
      ' : cardThrowTurnExpire : TIME_OUT_COUNT ::: ',
      TIME_OUT_COUNT,
      ' : cardThrowTurnExpire : TIME_OUT_COUNT :typeof:: ',
      typeof TIME_OUT_COUNT,
      ' : cardThrowTurnExpire : playerObj.isAuto ::: ',
      playerObj.isAuto,
      ' : cardThrowTurnExpire : playerObj.turnTimeout : NUMERICAL.TWO :: ',
      playerObj.turnTimeout >= NUMERICAL.TWO,
    );

    if (
      playerObj.turnTimeout >= TIME_OUT_COUNT - NUMERICAL.ONE &&
      !playerObj.isAuto
    ) {
      const userScoket = {
        id: playerObj.socketId,
        eventMetaData: { userId: userId },
      };
      const flag = PLAYER_STATE.TIMEOUT;
      // Player miss number of turn then defind in Auto Turn
      // change in to emit
      await Scheduler.addJob.leaveTableTimer({
        timer: NUMERICAL.ZERO * NUMERICAL.THOUSAND,
        jobId: `${playerGamePlay.userId}:${tableData.currentRound}`,
        tableId,
        flag,
        userScoket,
      });
      // await leaveTable(tableId, 'TIMEOUT', userScoket);
    } else {
      logger.info(
        'cardThrowTurnExpire : playerObj :: ',
        playerObj,
        ' : cardThrowTurnExpire : roundObj :: ',
        roundObj,
      );

      await Scheduler.cancelJob.playerTurnTimerCancel(
        `${userId}:${tableId}:${currentRound}`,
      );

      if (roundObj.currentTurn !== userId || !playerObj.isTurn)
        throw new Error('current turn is not your turn !');

      const userCards = [...playerObj.currentCards];
      let cardSequence = roundObj.turnCardSequence;

      let indexSequence = -1;
      if (isFTUE && roundObj.turnCount <= NUMERICAL.TWELVE) {
        const { throwCardIndex } = await userThrowCardTips(
          userCards,
          roundObj.turnCount,
        );
        indexSequence = throwCardIndex;
      } else {
        // if (
        //   cardSequence != CARD_SEQUENCE.CARD_NONE &&
        //   !roundObj.breakingSpades
        // ) {
        //   indexSequence = userCards.findIndex(
        //     (scard: string) =>
        //       scard.split('-')[0] === cardSequence &&
        //       scard.split('-')[0] != CARD_SEQUENCE.CARD_SPADES,
        //   );
        //   if (indexSequence === -1) {
        //     indexSequence = userCards.findIndex(
        //       (scard: string) => scard.split('-')[0] === cardSequence,
        //     );
        //   }
        //   if (indexSequence === -1) {
        //     indexSequence = userCards.findIndex(
        //       (scard: string) =>
        //         scard.split('-')[0] === CARD_SEQUENCE.CARD_SPADES,
        //     );
        //   }
        // } else if (
        //   cardSequence === CARD_SEQUENCE.CARD_NONE &&
        //   !roundObj.breakingSpades
        // ) {
        //   indexSequence = userCards.findIndex(
        //     (scard: string) =>
        //       scard.split('-')[0] != cardSequence &&
        //       scard.split('-')[0] != CARD_SEQUENCE.CARD_SPADES,
        //   );
        // } else {
        //   if (
        //     cardSequence != CARD_SEQUENCE.CARD_NONE &&
        //     roundObj.breakingSpades
        //   ) {
        //     indexSequence = userCards.findIndex(
        //       (scard: string) => scard.split('-')[0] === cardSequence,
        //     );
        //     if (indexSequence === -1) {
        //       indexSequence = userCards.findIndex(
        //         (scard: string) =>
        //           scard.split('-')[0] === CARD_SEQUENCE.CARD_SPADES,
        //       );
        //     }
        //     if (indexSequence === -1) {
        //       indexSequence = userCards.findIndex(
        //         (scard: string) => scard.split('-')[0] != cardSequence,
        //       );
        //     }
        //   } else if (
        //     cardSequence === CARD_SEQUENCE.CARD_NONE &&
        //     roundObj.breakingSpades
        //   ) {
        //     indexSequence = userCards.findIndex(
        //       (scard: string) => scard.split('-')[0] != cardSequence,
        //     );
        //   }
        // }

        if (cardSequence === CARD_SEQUENCE.CARD_NONE) {
          const getLowest: string[] = userCards.sort(
            (Acard: string, Bcard: string) => {
              const aCard = getCardNumber(Acard);
              const bCard = getCardNumber(Bcard);
              return aCard - bCard;
            },
          );
          const getLowestWithOutSpades: string[] = getLowest
            .map((fcard: string) => {
              if (fcard.split('-')[0] !== CARD_SEQUENCE.CARD_SPADES)
                return fcard;
              else return '';
            })
            .filter((e: string) => e);

          if (getLowestWithOutSpades.length === 0) {
            // throw lowest card
            indexSequence = userCards.findIndex(
              (scard: string) => scard === getLowest[0],
            );
          } else {
            // throw spades lowest card
            indexSequence = userCards.findIndex(
              (scard: string) => scard === getLowestWithOutSpades[0],
            );
          }
        } else {
          const seaquenceCardCheck: string[] = userCards
            .map((fcard: string) => {
              if (fcard.charAt(0) === roundObj.turnCardSequence) {
                return fcard;
              }
              return '';
            })
            .filter((e) => e);

          const getSpadesCard: string[] = userCards
            .map((fcard: string) => {
              if (fcard.split('-')[0] === CARD_SEQUENCE.CARD_SPADES)
                return fcard;
              else return '';
            })
            .filter((e: string) => e);

          let hightCardCheck: string[] = [];
          if (seaquenceCardCheck.length > 0) {
            hightCardCheck = seaquenceCardCheck.sort(
              (Acard: string, Bcard: string) => {
                const aCard = getCardNumber(Acard);
                const bCard = getCardNumber(Bcard);
                return bCard - aCard;
              },
            );

            // throw hight card as same suit
          } else if (getSpadesCard.length > 0) {
            hightCardCheck = getSpadesCard.sort(
              (Acard: string, Bcard: string) => {
                const aCard = getCardNumber(Acard);
                const bCard = getCardNumber(Bcard);
                return bCard - aCard;
              },
            );

            // throw hight spades card
          } else {
            hightCardCheck = userCards.sort((Acard: string, Bcard: string) => {
              const aCard = getCardNumber(Acard);
              const bCard = getCardNumber(Bcard);
              return bCard - aCard;
            });
            // throw hight spades card
          }
          indexSequence = userCards.findIndex(
            (scard: string) => scard === hightCardCheck[0],
          );
        }
      }
      logger.info('cardThrowTurnExpire : indexSequence :: ', indexSequence);

      let card = '';
      if (indexSequence !== -1) {
        card = userCards[indexSequence];
      } else {
        card = userCards[0];
      }
      logger.info('cardThrowTurnExpire : card :: ', card);
      const cardIndex = playerObj.currentCards.indexOf(card);
      if (cardIndex === -1) throw new Error('current card is not your !');

      if (cardSequence === CARD_SEQUENCE.CARD_NONE)
        cardSequence = card.split('-')[0];

      if (
        card.split('-')[0] === CARD_SEQUENCE.CARD_SPADES &&
        !roundObj.breakingSpades
      )
        roundObj.breakingSpades = true;

      playerObj.currentCards.splice(cardIndex, 1);
      /*
        update Turn History
        */
      await updateTurnHistory(
        tableId,
        currentRound,
        playerObj,
        HISTORY.TIME_OUT,
        card,
        playerObj.currentCards,
      );

      // playerObj.currentCards = playerObj.currentCards;
      if (!isFTUE) playerObj.turnTimeout += 1;

      const turnCards = roundObj.turnCurrentCards;
      turnCards.splice(playerObj.seatIndex, 1, card);
      roundObj.turnCurrentCards = turnCards;

      roundObj.turnCardSequence = cardSequence;

      playerObj.isTurn = false;
      logger.info(
        'cardThrowTurnExpire : ex :: playerObj :: ',
        playerObj,
        ' : cardThrowTurnExpire : ex :: roundObj :: ',
        roundObj,
      );

      await Promise.all([
        setPlayerGamePlay(userId, tableId, playerObj),
        setRoundTableData(tableId, currentRound, roundObj),
      ]);
      logger.info(`playerObj.isAuto : `, playerObj.isAuto ,`playerObj.turnTimeout :`, playerObj.turnTimeout)
      let turnTimeout: boolean = true;
      if (
        isFTUE ||
        (playerObj.isAuto && playerObj.turnTimeout != TIME_OUT_COUNT)
      ) {
        turnTimeout = false;
      }
      turnTimeout = !playerObj.isAuto && isAutoMode ? false : turnTimeout;
      const eventData = await formatUserThrowCardShow({
        seatIndex: playerObj.seatIndex,
        card,
        breakingSpades: roundObj.breakingSpades,
        turnTimeout,
      });

      // send User Throw Card Show Socket Event in Auto Turn
      CommonEventEmitter.emit(EVENTS.USER_THROW_CARD_SHOW_SOCKET_EVENT, {
        tableId: tableId.toString(),
        data: eventData,
      });
      
      changeThrowCardTurn(tableId.toString());
    }
  } catch (e) {
    logger.error(
      `CATCH_ERROR : cardThrowTurnExpire tableId :: ${tableId} :: userId: ${userId} :: `,
      e,
    );

    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    logger.info('cardThrowTurnExpire : Lock : ', tableId);
    if(cardThrowTurnExpireLock){
      await getLock.release(cardThrowTurnExpireLock);
    }
  }
}
