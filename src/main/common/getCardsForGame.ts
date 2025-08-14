const fortuna = require('javascript-fortuna');
const _ = require('underscore');
import { SINGLE_DECK, PLAYER_STATE } from '../../constants';

fortuna.init();

async function shuffleCards(cards: string[]) {
  const cloneCards: string[] = _.clone(cards);
  const shuffle: string[] = [];
  while (cloneCards.length > 0) {
    const randomNumber: number = Math.floor(Math.random() * cloneCards.length);
    shuffle.push(cloneCards[randomNumber]);
    cloneCards.splice(randomNumber, 1);
  }
  return shuffle;
}

async function getCardsForGame(playerInfo: any, maximumSeats: any) {
  /** club,diamond,heart,spade */
  let cards: string[] = [...SINGLE_DECK];

  // giving 13 cards for each player
  const allUsersCards: Array<string[]> = [];
  for (let i = 0; i < playerInfo.length; i++) {
    if (
      !_.isEmpty(playerInfo[i]) &&
      playerInfo[i].userStatus === PLAYER_STATE.PLAYING
    ) {
      const userCards: string[] = [];
      for (let j = 0; j < 13; j++) {
        // const ran = parseInt(fortuna.random() * cards.length, 10);
        const ran: number = fortuna.random() * cards.length;
        userCards.push(cards[ran]);
        cards.splice(ran, 1);
      }
      allUsersCards[i] = userCards;
    }
  }

  // selecting wildCards
  //  if joker comes in trumpCard then card shifting takes place until we get card that is not joker
  let shuffleDeck: any = shuffleCards(cards);
  shuffleDeck = shuffleCards(shuffleDeck);
  while (shuffleDeck[0] && shuffleDeck[0].split('-')[0] === 'J') {
    shuffleDeck.push(shuffleDeck[0]);
    shuffleDeck.splice(0, 1);
  }
  const trumpCard = shuffleDeck.splice(0, 1)[0];

  // selecting first face up card
  const firstOpenCard = shuffleDeck.splice(0, 1)[0]; // first cards to show
  return {
    currentCards: allUsersCards,
    trumpCard,
    closedDeck: shuffleDeck,
    opendDeck: firstOpenCard,
  };
}

export = getCardsForGame;
