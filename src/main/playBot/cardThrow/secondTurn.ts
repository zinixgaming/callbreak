import {CARD_SEQUENCE} from '../../../constants';
import logger from '../../logger';
import {getCardNumber} from '../../play/helpers/turn/cardThrow/utile';

// tack second turn for bot
async function secondTurn(
  userCards: string[],
  cardSequence: string,
  roundCurrentCards: string[],
): Promise<number> {
  let indexSequence: number = -1;

  const seaquenceCardCheck: string[] = userCards
    .map((fcard: string) => {
      if (fcard.charAt(0) === cardSequence) {
        return fcard;
      }
      return '';
    })
    .filter(e => e);

  const getSpadesCard: string[] = userCards
    .map((fcard: string) => {
      if (fcard.split('-')[0] === CARD_SEQUENCE.CARD_SPADES) return fcard;
      else return '';
    })
    .filter((e: string) => e);

  const spadesHighCardCheck: string | undefined = roundCurrentCards.find(
    fcard => {
      return (
        fcard.charAt(0) === CARD_SEQUENCE.CARD_SPADES &&
        cardSequence !== CARD_SEQUENCE.CARD_SPADES
      );
    },
  );

  let hightCardCheck: string[] = [];
  // if bot not have a same seaquence card and any other user throw a spades card
  if (seaquenceCardCheck.length === 0 && spadesHighCardCheck) {
    roundCurrentCards.sort((a, b) => {
      const cardA =
        Number(a.split('-')[1]) === 1 &&
        a.split('-')[0] === CARD_SEQUENCE.CARD_SPADES
          ? 14
          : a.split('-')[0] === CARD_SEQUENCE.CARD_SPADES
            ? Number(a.split('-')[1])
            : 0;
      const cardB =
        Number(b.split('-')[1]) === 1 &&
        b.split('-')[0] === CARD_SEQUENCE.CARD_SPADES
          ? 14
          : b.split('-')[0] === CARD_SEQUENCE.CARD_SPADES
            ? Number(b.split('-')[1])
            : 0;
      return cardB - cardA;
    });
    const userHaveSpadeHighCardOrNot = userCards.find(
      dcard =>
        dcard.charAt(0) === CARD_SEQUENCE.CARD_SPADES &&
        getCardNumber(dcard) > getCardNumber(roundCurrentCards[0]),
    );

    // bot have a high spades card
    if (userHaveSpadeHighCardOrNot) {
      hightCardCheck = [userHaveSpadeHighCardOrNot];
    } else {
      // bot not have a high spades card
      const noSpadesCard = userCards.find(
        dcard => dcard.charAt(0) !== CARD_SEQUENCE.CARD_SPADES,
      );
      // non spades card
      if (noSpadesCard) hightCardCheck = [noSpadesCard];
      else {
        const spadesCard = userCards.find(
          dcard => dcard.charAt(0) === CARD_SEQUENCE.CARD_SPADES,
        );
        // any spades card
        if (spadesCard) hightCardCheck = [spadesCard];
      }
    }
  } else if (seaquenceCardCheck.length > 0) {
    hightCardCheck = seaquenceCardCheck.sort((Acard: string, Bcard: string) => {
      const aCard = getCardNumber(Acard);
      const bCard = getCardNumber(Bcard);
      return bCard - aCard;
    });

    // throw hight card as same suit
  } else if (getSpadesCard.length > 0) {
    hightCardCheck = getSpadesCard.sort((Acard: string, Bcard: string) => {
      const aCard = getCardNumber(Acard);
      const bCard = getCardNumber(Bcard);
      return bCard - aCard;
    });

    // throw hight spades card
  } else {
    hightCardCheck = userCards.sort((Acard: string, Bcard: string) => {
      const aCard = getCardNumber(Acard);
      const bCard = getCardNumber(Bcard);
      return bCard - aCard;
    });
    // throw hight card
  }

  indexSequence = userCards.findIndex(
    (scard: string) => scard === hightCardCheck[0],
  );

  return indexSequence;
}

export = secondTurn;
