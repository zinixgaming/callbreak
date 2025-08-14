import logger from '../../logger';
import DB from '../../db';
import {MONGO} from '../../../constants';
import auth from '../auth';

async function getTableHistoryDetail(req: any, res: any) {
  try {
    logger.debug('setTableHistoryDetail :: req.body ::', req.body);
    const {tableId, gameId} = req.body;
    const authKey = req.headers['authorization'];

    // --------------for jwt auth with secretKey----------------------
    const key = await auth(authKey);
    logger.info('setTableHistoryDetail :: key :::>> ', key);
    if (key.data == gameId) {
      const query = {
        tableId,
      };
      const getCurrentRoundData = await DB.mongoQuery.getOne(
        MONGO.PLAYING_TRACKING_HISTORY,
        query,
      );

      if (!getCurrentRoundData) {
        const sendObject = {
          status: 200,
          success: false,
          message: 'Table histroy not found!',
          data: null,
        };
        return res.send(sendObject);
      } else {
        const sendObject = {
          status: 200,
          success: true,
          message: 'histroy!',
          data: getCurrentRoundData,
        };
        return res.send(sendObject);
      }
    } else {
      const sendObject = {
        status: 200,
        success: false,
        message: 'authorization fail',
        data: null,
      };
      return res.send(sendObject);
    }

    // ------------------------ for normal auth --------------------------
    // if (authKey !== seceretKey) {
    //     const sendObject = {
    //         status: 200,
    //         success: false,
    //         message: 'authorization fail',
    //         data: null,
    //     };
    //     res.send(sendObject);
    // }

    // const query = {
    //     tableId
    // }
    // const getCurrentRoundData = await DB.mongoQuery.getOne(MONGO.PLAYING_TRACKING_HISTORY, query);

    // if (!getCurrentRoundData) {
    //     const sendObject = {
    //         status: 200,
    //         success: false,
    //         message: 'Table histroy not found!',
    //         data: null,
    //     };
    //     res.send(sendObject);
    // } else {
    //     const sendObject = {
    //         status: 200,
    //         success: true,
    //         message: 'histroy!',
    //         data: getCurrentRoundData,
    //     };
    //     res.send(sendObject);
    // }
  } catch (error) {
    logger.error('CATCH_ERROR : setTableHistoryDetail :>> ', error);
  }
}

export = getTableHistoryDetail;
