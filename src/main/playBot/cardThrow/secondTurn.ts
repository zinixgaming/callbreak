import {CARD_SEQUENCE} from '../../../constants';
import {getCardNumber} from '../../play/helpers/turn/cardThrow/utile';

// Second turn logic for bot
async function secondTurn(
  userCards: string[],
  cardSequence: string,
  roundCurrentCards: string[],
): Promise<number> {
  let indexSequence: number = -1;

  // Remove placeholders like "U-0"
  const validRoundCards = roundCurrentCards.filter(
    c => c.includes('-') && c.split('-')[1] !== '0',
  );

  // Cards matching the required suit
  const sameSuitCards = userCards.filter(c => c.split('-')[0] === cardSequence);

  // All spades in hand
  const spadesCards = userCards.filter(
    c => c.split('-')[0] === CARD_SEQUENCE.CARD_SPADES,
  );

  // If a spade has been played and the suit is not spades
  const spadePlayed = validRoundCards.some(
    c => c.split('-')[0] === CARD_SEQUENCE.CARD_SPADES,
  );

  let chosenCard: string | undefined;

  // CASE 1: Has same suit as lead card
  if (sameSuitCards.length > 0) {
    // Find the highest card in the current round for that suit
    const highestInSuit = validRoundCards
      .filter(c => c.split('-')[0] === cardSequence)
      .sort((a, b) => getCardNumber(b) - getCardNumber(a))[0];

    const myHighest = sameSuitCards
      .slice()
      .sort((a, b) => getCardNumber(b) - getCardNumber(a))[0];

    // If my highest can't beat the current highest → play lowest card
    if (
      !highestInSuit ||
      getCardNumber(myHighest) <= getCardNumber(highestInSuit)
    ) {
      chosenCard = sameSuitCards
        .slice()
        .sort((a, b) => getCardNumber(a) - getCardNumber(b))[0];
    } else {
      // If I can beat it → play smallest winning card
      const winningCard = sameSuitCards
        .filter(c => getCardNumber(c) > getCardNumber(highestInSuit))
        .sort((a, b) => getCardNumber(a) - getCardNumber(b))[0];
      chosenCard = winningCard;
    }

    // CASE 2: No same suit and a spade was played → try to beat with smallest winning spade
  } else if (spadePlayed) {
    const highestSpade = validRoundCards
      .filter(c => c.split('-')[0] === CARD_SEQUENCE.CARD_SPADES)
      .sort((a, b) => getCardNumber(b) - getCardNumber(a))[0];

    const winningSpade = spadesCards
      .filter(c => getCardNumber(c) > getCardNumber(highestSpade))
      .sort((a, b) => getCardNumber(a) - getCardNumber(b))[0];

    if (winningSpade) {
      chosenCard = winningSpade; // beat with smallest possible spade
    } else {
      // can't win → throw lowest non-spade, else lowest spade
      chosenCard =
        userCards.find(c => c.split('-')[0] !== CARD_SEQUENCE.CARD_SPADES) ||
        spadesCards.sort((a, b) => getCardNumber(a) - getCardNumber(b))[0];
    }

    // CASE 3: No same suit but no spade played yet → play lowest spade if I must
  } else if (spadesCards.length > 0) {
    chosenCard = spadesCards
      .slice()
      .sort((a, b) => getCardNumber(a) - getCardNumber(b))[0];

    // CASE 4: No matching suit, no spades → throw lowest card overall
  } else {
    chosenCard = userCards
      .slice()
      .sort((a, b) => getCardNumber(a) - getCardNumber(b))[0];
  }

  if (chosenCard) {
    indexSequence = userCards.findIndex(c => c === chosenCard);
  }

  return indexSequence;
}

export = secondTurn;
