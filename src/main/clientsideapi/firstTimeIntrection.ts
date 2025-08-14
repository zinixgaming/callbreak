import axios from 'axios';
import logger from '../logger';
import {getConfig} from '../../config';
import CommonEventEmitter from '../commonEventEmitter';
import Errors from '../errors';
import {EVENTS, MESSAGES, NUMERICAL} from '../../constants';
import {firstTimeIntrectionInput} from '../interface/cmgApiIf';
const {FTUE_UPDATE, APP_KEY, APP_DATA} = getConfig();

async function firstTimeIntrection(
  gameId: string,
  gameModeId: string,
  token: string,
  socketId: string,
  userId: string,
): Promise<any> {
  logger.debug(userId, 'firstTimeIntrection ::> ', gameId, token, socketId);
  try {
    const url = FTUE_UPDATE;

    const data: firstTimeIntrectionInput = {gameId};
    if (gameModeId) {
      data.gameModeId = gameModeId;
    }
    logger.info(userId, 'resData firstTimeIntrection :: data ::>> ', data);

    const responce = await axios.post(url, data, {
      headers: {
        Authorization: `${token}`,
        'x-mgpapp-key': APP_KEY,
        'x-mgpapp-data': APP_DATA,
      },
    });
    logger.info(userId, 'resData firstTimeIntrection : : >> ', responce.data);

    const firstTimeIntrectionDetail = responce.data;
    logger.info(
      userId,
      'resData : firstTimeIntrectionDetail :: ',
      firstTimeIntrectionDetail,
    );

    if (!responce || !responce.data.success || !firstTimeIntrectionDetail) {
      throw new Errors.InvalidInput('Unable to fetch firstTimeIntrection data');
    }
    if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
      logger.info(userId, `Server under the maintenance.`);
      throw new Errors.UnknownError('Unable to fetch firstTimeIntrection data');
    }
    return true;
  } catch (error: any) {
    logger.error(
      userId,
      'CATCH_ERROR :  firstTimeIntrection :>> ',
      gameId,
      token,
      '-',
      error,
    );

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
  firstTimeIntrection,
};

export = exportedObj;
