import axios from 'axios';
import logger from '../logger';
import Errors from '../errors';
import CommonEventEmitter from '../commonEventEmitter';
import {EVENTS, MESSAGES} from '../../constants';
import {getMatchDataIf} from '../interface/cmgApiIf';
import {getConfig} from '../../config';
import {Socket} from 'socket.io';
const Config_data = getConfig();
const {GET_MATCH_DATA, APP_KEY, APP_DATA} = Config_data;

async function getMatchData(
  data: getMatchDataIf,
  token: string | undefined,
  socketId: Socket,
) {
  try {
    console.log('Getting the winning data ', data, token);

    const url = GET_MATCH_DATA;
    console.log(data.userId, 'checkBalance url :: ', url);
    console.log(data.userId, 'APP_KEY : ', APP_KEY, 'APP_DATA : ', APP_DATA);
    const responce = await axios.post(url, data, {
      headers: {
        Authorization: `${token}`,
        'x-mgpapp-key': APP_KEY,
        'x-mgpapp-data': APP_DATA,
      },
    });
    console.log(data.userId, 'resData : get Match Data :: ', responce.data);

    const getMatchdata = responce.data.data;
    console.log(data.userId, 'resData : getMatchdata :: ', getMatchdata);

    if (!responce || !responce.data.success || !getMatchdata) {
      throw new Errors.InvalidInput('Unable to fetch getMatchdata data');
    }
    if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
      console.log(data.userId, `Server under the maintenance.`);
      throw new Errors.UnknownError('Unable to fetch checkBalance data');
    }
    return {data: getMatchdata};
  } catch (error: any) {
    logger.error(
      data.userId,
      'CATCH_ERROR :  getMatchData :>> ',
      data,
      token,
      '-',
      error,
    );
    // logger.error(data.userId, "error.response.data ", error?.response?.data);

    if (error instanceof Errors.UnknownError) {
      const nonProdMsg = 'Server under the maintenance!';
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socketId: socketId,
        data: {message: MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE},
      });
    } else if (
      error?.response &&
      error?.response?.data &&
      !error?.response?.data?.success
    ) {
      const nonProdMsg = 'Fetch data failed!';
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socketId: socketId,
        data: {
          message: error.response.data.message
            ? error.response.data.message
            : MESSAGES.ERROR.COMMON_ERROR,
        },
      });
    } else {
      const nonProdMsg = 'Fetch data failed!';
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socketId: socketId,
        data: {message: MESSAGES.ERROR.COMMON_ERROR},
      });
    }
    throw error;
  }
}

const exportedObj = {
  getMatchData,
};

export = exportedObj;
