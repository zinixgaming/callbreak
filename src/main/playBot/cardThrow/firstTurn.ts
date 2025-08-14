import {CARD_SEQUENCE, NUMERICAL} from '../../../constants';
import {playerPlayingDataIf} from '../../interface/playerPlayingTableIf';
import logger from '../../logger';
import {getCardNumber} from '../../play/helpers/turn/cardThrow/utile';

// tack first for bot
async function firstTurn(
  playerGamePlay: playerPlayingDataIf,
  userCards: string[],
): Promise<number> {
  let indexSequence: number = -1;
  const {bid, currentCards} = playerGamePlay;
  //   const { bid, userId } = playerGamePlay;
  const getLowest: string[] = userCards.sort((Acard: string, Bcard: string) => {
    const aCard = getCardNumber(Acard);
    const bCard = getCardNumber(Bcard);
    return aCard - bCard;
  });
  const getLowestWithOutSpades: string[] = getLowest
    .map((fcard: string) => {
      if (fcard.split('-')[0] !== CARD_SEQUENCE.CARD_SPADES) return fcard;
      else return '';
    })
    .filter((e: string) => e);
  if (bid === NUMERICAL.ONE) {
    if (getLowestWithOutSpades.length === 0) {
      // throw spades lowest card
      indexSequence = userCards.findIndex(
        (scard: string) => scard === getLowest[0],
      );
    } else {
      // throw lowest card
      indexSequence = userCards.findIndex(
        (scard: string) => scard === getLowestWithOutSpades[0],
      );
    }
  } else {
    if (getLowestWithOutSpades.length === 0) {
      // throw spades High card
      indexSequence = userCards.findIndex(
        (scard: string) => scard === getLowest[getLowest.length - 1],
      );
    } else {
      // throw High card
      indexSequence = userCards.findIndex(
        (scard: string) =>
          scard === getLowestWithOutSpades[getLowestWithOutSpades.length - 1],
      );
    }
  }

  // let card = '';
  // if (indexSequence !== -1) {
  //   card = userCards[indexSequence];
  // } else {
  //   card = userCards[0];
  // }
  // logger.info('cardThrowTurnExpire : card :: ', card);
  // const cardIndex = currentCards.indexOf(card);
  // if (cardIndex === -1) throw new Error('current card is not your !');

  // const sendObject = {
  //   cardIndex,
  //   card,
  // };

  return indexSequence;
}

export = firstTurn;
