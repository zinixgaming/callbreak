import {CARD_SEQUENCE, NUMERICAL} from '../../../constants';
import {playerPlayingDataIf} from '../../interface/playerPlayingTableIf';
import {getCardNumber} from '../../play/helpers/turn/cardThrow/utile';

// First turn logic for bot
async function firstTurn(
  playerGamePlay: playerPlayingDataIf,
  userCards: string[],
): Promise<number> {
  let indexSequence = -1;
  const {bid} = playerGamePlay;

  // Remove any placeholders (e.g., "U-0") from userCards just in case
  const validUserCards = userCards.filter(
    c => c.includes('-') && c.split('-')[1] !== '0',
  );

  // Sort lowest to highest by value
  const sortedCards = [...validUserCards].sort(
    (a, b) => getCardNumber(a) - getCardNumber(b),
  );

  // Same list but without spades
  const sortedWithoutSpades = sortedCards.filter(
    c => c.split('-')[0] !== CARD_SEQUENCE.CARD_SPADES,
  );

  let chosenCard: string | undefined;

  // If bid is 1 — play safe, throw lowest
  if (bid === NUMERICAL.ONE) {
    if (sortedWithoutSpades.length > 0) {
      chosenCard = sortedWithoutSpades[0]; // lowest non-spade
    } else {
      chosenCard = sortedCards[0]; // lowest spade
    }

    // If bid is more than 1 — play aggressively
  } else {
    if (sortedWithoutSpades.length > 0) {
      chosenCard = sortedWithoutSpades[sortedWithoutSpades.length - 1]; // highest non-spade
    } else {
      chosenCard = sortedCards[sortedCards.length - 1]; // highest spade
    }
  }

  // Find chosen card's index in the original userCards array
  if (chosenCard) {
    indexSequence = userCards.findIndex(c => c === chosenCard);
  }

  return indexSequence;
}

export = firstTurn;
