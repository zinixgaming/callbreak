import logger from '../../logger';
import {SINGLE_DECK, NUMERICAL, STATIC_USER_CARD} from '../../../constants';
import {playerPlayingDataIf} from '../../interface/playerPlayingTableIf';
import Validator from '../../Validator';

function shuffleCards(cards: string[]) {
  const shuffle: string[] = [];
  while (cards.length > 0) {
    const randomNumber: number = Math.floor(Math.random() * cards.length);
    shuffle.push(cards[randomNumber]);
    cards.splice(randomNumber, 1);
  }
  return shuffle;
}
// formant Card Suit Wise and Rung Wise
async function setCardSuitWise(card: string[]) {
  logger.debug(
    'setCardSuitWise : card type :: ',
    typeof card[0].split('-')[1],
    ' : card setCardSuitWise :: ',
    card,
  );

  card.sort((f: any, e: any) => {
    const a = f.split('-')[1] === '1' ? '14' : f.split('-')[1];
    const b = e.split('-')[1] === '1' ? '14' : e.split('-')[1];
    return a - b;
  });

  logger.info('setCardSuitWise : card setCardSuitWise : 1 ::', card);
  const hearts: string[] = [];
  const clubs: string[] = [];
  const diamond: string[] = [];
  const spades: string[] = [];
  card.forEach((userCard: string, index: any) => {
    const rang = userCard.split('-')[0];
    if (rang === 'H') {
      hearts.push(userCard);
    } else if (rang === 'C') {
      clubs.push(userCard);
    } else if (rang === 'D') {
      diamond.push(userCard);
    } else if (rang === 'S') {
      spades.push(userCard);
    }
  });
  const uCard = [...hearts, ...clubs, ...diamond, ...spades];

  logger.info('setCardSuitWise : cardLog :: ', uCard);

  return uCard;
}

// Distribute Cards for all player
async function distributeCards(
  playersData: playerPlayingDataIf[],
  isFTUE: boolean,
  counter: number,
) {
  try {
    playersData =
      await Validator.methodValidator.distributeCardsValidator(playersData);

    /** club,diamond,heart,spade */

    let tempUsersCards: Array<string[]> = [];

    if (counter == NUMERICAL.ONE) {
      const cards = [...SINGLE_DECK];
      logger.info('distributeCards : user Card :: ', JSON.stringify(cards));
      // const spadeCardArr = cards.splice(-13);
      // giving 13 cards to each player
      if (!isFTUE) {
        for (let i = 0; i < playersData.length; ++i) {
          const userCards: string[] = [];
          for (let j = 0; j < NUMERICAL.THIRTEEN; j++) {
            const ran = Math.floor(Math.random() * cards.length - 1) + 1;
            userCards.push(cards[ran]);
            cards.splice(ran, 1);
          }
          tempUsersCards[i] = userCards;
        }
      } else {
        tempUsersCards = [...STATIC_USER_CARD];
      }
    } else {
      //second time cards Distribution
      logger.info('<<== second time cards Distribution ==>>');
      const cards = [...SINGLE_DECK];
      logger.info('distributeCards : user Card :: ', JSON.stringify(cards));
      const spadeCardArr = cards.splice(-4);
      console.log('length =>', spadeCardArr.length, cards.length);
      // giving 13 cards to each player
      if (!isFTUE) {
        for (let i = 0; i < playersData.length; ++i) {
          const userCards: string[] = [];
          userCards.push(spadeCardArr[i]);
          for (let j = 0; j < NUMERICAL.TWELVE; j++) {
            const ran = Math.floor(Math.random() * cards.length - 1) + 1;
            userCards.push(cards[ran]);
            cards.splice(ran, 1);
          }
          tempUsersCards[i] = userCards;
        }
      } else {
        tempUsersCards = [...STATIC_USER_CARD];
      }
    }

    logger.info(
      'distributeCards : tempUsersCards :: ',
      JSON.stringify(tempUsersCards),
    );
    const usersCards: Array<Array<string>> = [];
    for await (const userCard of tempUsersCards) {
      const cards: string[] = await setCardSuitWise(userCard);
      usersCards.push(cards);
    }

    logger.info(
      'distributeCards : usersCards with setCardSuitWise :: ',
      JSON.stringify(usersCards),
      {
        usersCards,
      },
      ' :::: card distribution fun response ',
    );

    return usersCards;
  } catch (error) {
    logger.error(`CATCH_ERROR : distributeCards ::  `, playersData, error);
    throw error;
  }
}

export = distributeCards;
