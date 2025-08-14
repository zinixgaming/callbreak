import logger from "../../logger";
import { userSeatsIf } from "../../interface/roundTableIf";
import Validator from "../../Validator";
/* select Game Dealer
 1st time select random then select clock wise
*/
async function chooseDealer(
  seats: userSeatsIf,
  dealer: string,
  isFTUE: boolean
): Promise<{ dealerId: string; dealerIndex: number }> {
  logger.info("chooseDealer : dealer :: ", dealer, " : seats :: ", seats);

  try {
    await Validator.methodValidator.chooseDealerValidator(seats);
    let randomIndex: number = -1;
    const totalPlayers = Object.keys(seats).length;
    if (!isFTUE) {
      if (dealer != null) {
        const dealerKey = Object.keys(seats).filter(
          (key) => seats[key].userId === dealer
        );
        randomIndex = seats[`${dealerKey[0]}`].seatIndex;

        if (
          (randomIndex !== 3 && totalPlayers > 2) ||
          (randomIndex !== 1 && totalPlayers === 2)
        )
          randomIndex += 1;
        else randomIndex = 0;
      } else {
        randomIndex = Math.floor(Math.random() * totalPlayers);
      }
    } else {
      randomIndex = 0;
    }

    logger.info("chooseDealer : randomIndex :: ", randomIndex);
    const seat = seats[`s${randomIndex}`];
    logger.info("chooseDealer : seat :: ", seat);
    return { dealerId: seat.userId, dealerIndex: randomIndex };
  } catch (error) {
    console.log("CATCH_ERROR : chooseDealer :: dealer :", dealer);
    logger.error(
      `CATCH_ERROR : chooseDealer :: dealer : ${dealer} `,
      seats,
      error
    );
    throw error;
  }
}

export = chooseDealer;
