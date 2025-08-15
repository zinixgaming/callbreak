import {CARD_SEQUENCE} from '../../../constants';
import {getCardNumber} from '../../play/helpers/turn/cardThrow/utile';

// Second turn logic for bot
async function secondTurn(
  userCards: string[],
  cardSequence: string,
  roundCurrentCards: string[],
): Promise<number> {
  let indexSequence: number = -1;

  // Filter out unplayed/placeholder cards like "U-0"
  const validRoundCards = roundCurrentCards.filter(
    c => c.includes('-') && c.split('-')[1] !== '0',
  );

  // Cards matching the required suit
  const sameSuitCards: string[] = userCards.filter(
    fcard => fcard.split('-')[0] === cardSequence,
  );

  // All spade cards
  const spadesCards: string[] = userCards.filter(
    fcard => fcard.split('-')[0] === CARD_SEQUENCE.CARD_SPADES,
  );

  // Check if someone already played a spade in this turn (when suit is not spades)
  const spadesHighCardPlayed = validRoundCards.find(
    fcard =>
      fcard.split('-')[0] === CARD_SEQUENCE.CARD_SPADES &&
      cardSequence !== CARD_SEQUENCE.CARD_SPADES,
  );

  let chosenCard: string | undefined;

  // CASE 1: No same-suit card & spade already played
  if (sameSuitCards.length === 0 && spadesHighCardPlayed) {
    // Sort spades in round to find highest
    const highestSpadeInRound = [...validRoundCards]
      .filter(c => c.split('-')[0] === CARD_SEQUENCE.CARD_SPADES)
      .sort((a, b) => getCardNumber(b) - getCardNumber(a))[0];

    // Bot has a spade higher than the current highest spade
    const higherSpade = spadesCards.find(
      c => getCardNumber(c) > getCardNumber(highestSpadeInRound),
    );

    if (higherSpade) {
      chosenCard = higherSpade; // Win with high spade
    } else {
      // Throw lowest non-spade if possible
      const nonSpade = userCards.find(
        c => c.split('-')[0] !== CARD_SEQUENCE.CARD_SPADES,
      );
      chosenCard = nonSpade || spadesCards[0];
    }

    // CASE 2: Has same suit — throw highest of that suit
  } else if (sameSuitCards.length > 0) {
    chosenCard = [...sameSuitCards].sort(
      (a, b) => getCardNumber(b) - getCardNumber(a),
    )[0];

    // CASE 3: No same suit, throw highest spade
  } else if (spadesCards.length > 0) {
    chosenCard = [...spadesCards].sort(
      (a, b) => getCardNumber(b) - getCardNumber(a),
    )[0];

    // CASE 4: No spades, throw highest card overall
  } else {
    chosenCard = [...userCards].sort(
      (a, b) => getCardNumber(b) - getCardNumber(a),
    )[0];
  }

  // Find index of chosen card in original userCards array
  if (chosenCard) {
    indexSequence = userCards.findIndex(c => c === chosenCard);
  }

  return indexSequence;
}

export = secondTurn;
