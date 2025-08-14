import logger from '../../logger';
import DB from '../../db';
import {MONGO, NUMERICAL} from '../../../constants';
import {getConfig} from '../../../config';
import validator from '../../Validator';
import {flageDataIf} from '../../interface/cmgApiIf';
const {GAME_ID} = getConfig();

async function cronJob(): Promise<any> {
  try {
    const date = new Date();

    const gameId: string = GAME_ID;
    logger.info('cronJob  :: gameId ::> ', gameId);
    const flage = await DB.mongoQuery.getOne(MONGO.FLAGE, {gameId: gameId});
    logger.info('cronJob  :: flage :: ', flage);

    if (flage) {
      logger.info('get flage ::===>> ', flage);

      // date.setDate(date.getDate() - flage.noOfLastTrakingDays)
      // let trackedLobbyQuery = {
      //     createdAt: { $lte: date.toLocaleDateString("en-US") }// date.toLocaleDateString("en-US")
      // }

      // const promise_a = await DB.mongoQuery.removeAll(MONGO.PLAYING_TRACKING_LOBBY, trackedLobbyQuery)

      // const promise_b = await DB.mongoQuery.removeAll(MONGO.PLAYING_TRACKING_HISTORY, trackedLobbyQuery)

      // return Promise.all([promise_a, promise_b]);
    } else {
      let flageData: flageDataIf = {
        gameId,
        isPlayingTracking: true,
        noOfLastTrakingDays: NUMERICAL.ZERO,
      };
      console.log('flageData :==>> ', flageData);
      flageData =
        await validator.playingTrackingValidator.playingTrackingFlageValidator(
          flageData,
        );
      await DB.mongoQuery.add(MONGO.FLAGE, flageData);
    }
  } catch (error) {
    logger.error('CATCH_ERROR : cronJob ', error);
  }
}

export = cronJob;
