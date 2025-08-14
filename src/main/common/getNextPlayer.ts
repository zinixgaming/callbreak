import logger from "../logger";
import { userSeatsIf } from "../interface/roundTableIf";
import Validator from "../Validator";
import Errors from "../errors";
import { NUMERICAL } from "../../constants";

// get next player turn ObjectId
async function getNextPlayer(seats: userSeatsIf, dealerId: string) {
  try {
    logger.info("seats :: ", seats, " dealerId ::", dealerId);

    await Validator.methodValidator.getNextPlayerValidator(seats);
    const index: any = Object.keys(seats).find(
      (key) => dealerId === seats[key].userId
    );
    const currentIndex = seats[index].seatIndex;

    logger.info("currentIndex :: -->>", currentIndex);
    let nextIndex = (currentIndex - 1) % Object.keys(seats).length;

    if (nextIndex === -NUMERICAL.ONE) {
      nextIndex = Object.keys(seats).length - NUMERICAL.ONE
    }

    logger.info("nextIndex :: -->", nextIndex);
    return seats[`s${nextIndex}`].userId;
  } catch (error) {
    logger.error(
      `CATCH_ERROR : getNextPlayer dealerId: ${dealerId} :: `,
      seats,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

export = getNextPlayer;
