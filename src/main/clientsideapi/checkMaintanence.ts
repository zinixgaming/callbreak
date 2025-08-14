import axios from 'axios';
import logger from '../logger';
import Errors from '../errors';
import CommonEventEmitter from '../commonEventEmitter';
import {checkBalanceIf} from '../interface/cmgApiIf';
import {getConfig} from '../../config';
import {EVENTS, MESSAGES, NUMERICAL} from '../../constants';
const {CHECK_MAINTANENCE, APP_KEY, APP_DATA} = getConfig();

async function checkMaintanence(
  token: string,
  socketId: string,
  userId: string,
) {
  logger.debug('checkMaintanence ::=>> ', token);
  try {
    const url = CHECK_MAINTANENCE;
    logger.debug(userId, 'checkMaintanence url :: ', url);
    logger.debug(userId, 'APP_KEY : ', APP_KEY, 'APP_DATA : ', APP_DATA);
    const responce = await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `${token}`,
          'x-mgpapp-key': APP_KEY,
          'x-mgpapp-data': APP_DATA,
        },
      },
    );
    logger.info(userId, 'resData : checkBalance responce :: ', responce.data);

    const checkMaintanenceDetail = responce.data.data;
    logger.info(
      userId,
      'resData : checkMaintanenceDetail :: ',
      checkMaintanenceDetail,
    );

    if (!responce || !responce.data.success || !checkMaintanenceDetail) {
      throw new Errors.InvalidInput('Unable to fetch checkBalance data');
    }
    return checkMaintanenceDetail;
  } catch (error: any) {
    logger.error(userId, 'CATCH_ERROR :  checkBalance :>> ', token, '-', error);

    if (
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
  checkMaintanence,
};

export = exportedObj;
