import {randomInt} from 'crypto';
import logger from '../../logger';
import {NUMERICAL} from '../../../constants';

const getRandomNumber = (min: number, max: number): number => {
  return randomInt(min, max + 1); // max is exclusive, so +1
};

const userThrowCardTips = (currentCards: string[], turnCount: number) => {
  const sendObject = {
    card: '',
    throwCardIndex: -1,
  };
  logger.info('userThrowCardTips :: turnCount :', turnCount);
  // if (turnCount === NUMERICAL.THREE) {
  //   card = currentCards[0];
  // }

  switch (turnCount) {
    case NUMERICAL.ONE: // 1
    case NUMERICAL.TWO: // 2
    case NUMERICAL.FOUR: // 4
      sendObject.card = currentCards[0];
      sendObject.throwCardIndex = 0;
      break;
    case NUMERICAL.THREE: // 3
    case NUMERICAL.TEN: // 10
    case NUMERICAL.ELEVEN: // 11
      sendObject.card = currentCards[1];
      sendObject.throwCardIndex = 1;
      break;
    case NUMERICAL.FIVE: // 5
      sendObject.card = currentCards[2];
      sendObject.throwCardIndex = 2;
      break;
    case NUMERICAL.EIGHT: // 8
    case NUMERICAL.NINE: // 9
      sendObject.card = currentCards[3];
      sendObject.throwCardIndex = 3;
      break;
    case NUMERICAL.SIX: // 6
    case NUMERICAL.SEVEN: // 7
      sendObject.card = currentCards[5];
      sendObject.throwCardIndex = 5;
      break;
    case NUMERICAL.TWELVE: // 12
      sendObject.card = currentCards[6];
      sendObject.throwCardIndex = 6;
      break;

    default:
      break;
  }
  return sendObject;
};
const exportObject = {
  getRandomNumber,
  userThrowCardTips,
};

export = exportObject;
