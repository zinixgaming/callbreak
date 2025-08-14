import axios from 'axios';
import logger from '../logger';
import {getConfig} from '../../config';
import {multiPlayerWinnScoreIf} from '../interface/cmgApiIf';
import CommonEventEmitter from '../commonEventEmitter';
import Errors from '../errors';
import {EVENTS, MESSAGES, NUMERICAL} from '../../constants';
const {MULTI_PLAYER_SUBMIT_SCORE, APP_KEY, APP_DATA} = getConfig();

async function multiPlayerWinnScore(
  data: multiPlayerWinnScoreIf,
  token: string,
  socketId: string,
) {
  logger.debug(data.tableId, 'multiPlayerWinnScore ===>>> :: ', data, token);
  try {
    const url = MULTI_PLAYER_SUBMIT_SCORE;

    const responce = await axios.post(url, data, {
      headers: {
        Authorization: `${token}`,
        'x-mgpapp-key': APP_KEY,
        'x-mgpapp-data': APP_DATA,
      },
    });
    logger.info(
      data.tableId,
      'multiPlayerWinnScore : responce :: ==>> ',
      responce.data,
    );

    const multiPlayerSubmitScoreData = responce.data.data;
    logger.info(
      data.tableId,
      'resData :: multiPlayerSubmitScore :: ==>>',
      multiPlayerSubmitScoreData,
    );

    if (!responce || !responce.data.success || !multiPlayerSubmitScoreData) {
      throw new Errors.InvalidInput(
        'Unable to fetch multiPlayerSubmitScoreData data',
      );
    }
    if (responce.data.message === MESSAGES.ERROR.SERVER_UNDER_THE_MAINTENANCE) {
      logger.info(data.tableId, `Server under the maintenance.`);
      throw new Errors.UnknownError(
        'Unable to fetch multiPlayerSubmitScoreData data',
      );
    }

    return multiPlayerSubmitScoreData;
  } catch (error: any) {
    logger.error(
      data.tableId,
      'CATCH_ERROR : multi Player Winn Score:  :>> ',
      error,
      '-',
      data,
      token,
    );

    if (error instanceof Errors.UnknownError) {
      const nonProdMsg = 'Server under the maintenance!';
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        tableId: data.tableId,
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
        tableId: data.tableId,
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
        tableId: data.tableId,
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
    return true;
  }
}

const exportedObj = {
  multiPlayerWinnScore,
};

export = exportedObj;
