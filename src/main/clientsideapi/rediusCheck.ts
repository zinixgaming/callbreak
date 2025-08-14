import axios from 'axios';
import logger from '../logger';
import {getConfig} from '../../config';
import CommonEventEmitter from '../commonEventEmitter';
import Errors from '../errors';
import {EVENTS, MESSAGES, NUMERICAL} from '../../constants';
const {REDIUS_CHECK, APP_KEY, APP_DATA} = getConfig();

async function rediusCheck(
  gameId: string,
  token: string,
  socketId: string,
  tableId: string,
): Promise<any> {
  logger.debug(tableId, 'rediusCheck :: ', gameId, token);
  try {
    const url = REDIUS_CHECK;

    const responce = await axios.post(
      url,
      {gameId},
      {
        headers: {
          Authorization: `${token}`,
          'x-mgpapp-key': APP_KEY,
          'x-mgpapp-data': APP_DATA,
        },
      },
    );
    logger.info(tableId, 'rediusCheck : responce :: ', responce.data);

    const result = responce.data.data;
    logger.info(tableId, 'resData : rediusCheck result ::', result);

    if (!responce || !responce.data || !responce.data.success) {
      throw new Errors.InvalidInput('Unable to fetch redius Check data');
    }
    if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
      logger.info(tableId, `Server under the maintenance.`);
      throw new Errors.UnknownError('Unable to fetch redius Check data');
    }
    return result;
  } catch (error: any) {
    logger.error(tableId, 'CATCH_ERROR : rediusCheck :: ', token, '-', error);

    if (error instanceof Errors.UnknownError) {
      const nonProdMsg = 'Server under the maintenance!';
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else if (
      error?.response &&
      error?.response?.data &&
      !error?.response?.data?.success
    ) {
      const nonProdMsg = 'Fetch data failed!';
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: error.response.data.message
            ? error.response.data.message
            : MESSAGES.ERROR.COMMON_ERROR,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else {
      const nonProdMsg = 'Fetch data failed!';
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.COMMON_ERROR,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    }
    throw error;
  }
}

const exportedObj = {
  rediusCheck,
};
export = exportedObj;
