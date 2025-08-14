import {NUMERICAL} from '../../../constants';

const selectCardForBot = (currentCards: string[], turnCount: number) => {
  let card = '';
  switch (turnCount) {
    case NUMERICAL.ONE || NUMERICAL.TWO:
      card = currentCards[0];
      break;
    case NUMERICAL.THREE || NUMERICAL.TEN || NUMERICAL.ELEVEN:
      card = currentCards[1];
      break;
    case NUMERICAL.FIVE:
      card = currentCards[2];
      break;
    case NUMERICAL.SIX || NUMERICAL.SEVEN:
      card = currentCards[5];
      break;
    case NUMERICAL.EIGHT || NUMERICAL.NINE:
      card = currentCards[3];
      break;

    default:
      break;
  }
  return card;
};
export = selectCardForBot;
