import logger from '../logger';
import Errors from '../errors';
import DB from '../db';
import { MONGO, NUMERICAL } from '../../constants';

async function gameLossCount(csid: string) {
  logger.debug('gameLossCount ::', csid);
  try {
    const query = {
      csid,
    };

    const getUserDetail = await DB.mongoQuery.getOne(MONGO.USER, query);
    logger.debug('gameLossCount: getUserDetail :: ', getUserDetail);

    if (getUserDetail) {
      const update = {
        $inc: {
          totalGamePlayed: NUMERICAL.ONE,
          totalGameLoss: NUMERICAL.ONE,
        },
      };

      const updatedtotalGamePlayed = await DB.mongoQuery.updateByCond(
        MONGO.USER,
        query,
        update,
      );
      logger.debug(
        'gameLossCount : updatedtotalGamePlayed :: ',
        updatedtotalGamePlayed,
      );
    }

    return getUserDetail;
  } catch (error) {
    logger.error('CATCH_ERROR: gameLossCount :: ', error, '-', csid);
    if (error instanceof Errors.UnknownError) {
      throw new Errors.UnknownError(error);
    }
  }
}

export = gameLossCount;
