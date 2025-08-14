import logger from '../logger';
import Errors from '../errors';
import DB from '../db';
import {MONGO, NUMERICAL} from '../../constants';

async function gameWinnerCount(csid: string) {
  logger.debug('gameWinnerCount ::', csid);
  try {
    const query = {
      csid,
    };

    const getUserDetail = await DB.mongoQuery.getOne(MONGO.USER, query);
    logger.debug('gameWinnerCount: getUserDetail :: ', getUserDetail);

    if (getUserDetail) {
      const update = {
        $inc: {
          totalGamePlayed: NUMERICAL.ONE,
          totalGameWinn: NUMERICAL.ONE,
        },
      };

      const updatedtotalGamePlayed = await DB.mongoQuery.updateByCond(
        MONGO.USER,
        query,
        update,
      );
    }

    return getUserDetail;
  } catch (error) {
    logger.error('CATCH_ERROR: gameWinnerCount :: ', error, '-', csid);
    if (error instanceof Errors.UnknownError) {
      throw new Errors.UnknownError(error);
    }
  }
}

export = gameWinnerCount;
