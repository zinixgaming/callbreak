import Logger from '../logger';
import CryptoJS from 'crypto-js';
import {getConfig} from '../../config';
const {SECRET_KEY} = getConfig();
import Errors from '../errors';
import {
  EMPTY,
  EVENTS,
  MESSAGES,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
} from '../../constants';
import CommonEventEmitter from '../commonEventEmitter';
import {
  getRoundTableData,
  getTableData,
  getUser,
  setUser,
} from '../gameTable/utils';
import {userIf} from '../interface/userSignUpIf';
import leaveTable from '../play/leaveTable';

async function multipleLoginHandler(req: any, res: any) {
  try {
    Logger.info('multipleLoginHandler :: req.body  :::', req.body);

    const authKey = req.headers['authorization'];
    Logger.info('multipleLoginHandler :: authKey  :::', authKey);
    const userId = CryptoJS.AES.decrypt(authKey, SECRET_KEY).toString(
      CryptoJS.enc.Utf8,
    );
    Logger.info('multipleLoginHandler :: userId :::', userId);

    if (!userId) {
      const resObj = {
        status: 400,
        success: true,
        message: 'oops ! Something want wrong',
        data: null,
      };
      return res.send(resObj);
    }

    // get updated table value

    const userProfile: userIf = await getUser(userId);
    if (!userProfile)
      throw new Errors.UnknownError('Unable to get user Profile ');
    if (req.body && req.body.token) {
      userProfile.authToken = req.body.token;
      await setUser(userId, userProfile);
    }

    if (userProfile && userProfile.tableId != EMPTY) {
      const tableData = await getTableData(userProfile.tableId);
      const roundTableData = await getRoundTableData(
        userProfile.tableId,
        NUMERICAL.ONE,
      );
      if (
        (roundTableData &&
          roundTableData.tableState !== TABLE_STATE.WINNER_DECLARED &&
          roundTableData.tableState !== TABLE_STATE.SCOREBOARD_DECLARED) ||
        (tableData && tableData.winner.length !== NUMERICAL.ONE)
      ) {
        const socketObj = {
          id: userProfile.socketId,
          eventMetaData: {
            userObjectId: userProfile._id,
            tableId: tableData._id,
            userId: userProfile.userId,
          },
        };
        await leaveTable(
          tableData._id,
          PLAYER_STATE.LEFT,
          socketObj,
          undefined,
          false,
        );
      } else {
        const msg = MESSAGES.ERROR.MULTIPLE_LOGIN_FAILED_MSG;
        let nonProdMsg = '';
        const errorCode = 500;
        nonProdMsg = 'FAILED';

        CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
          socket: userProfile.socketId,
          data: {
            isPopup: true,
            popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
            title: nonProdMsg,
            message: msg,
            tableId: userProfile.tableId,
            buttonCounts: NUMERICAL.ONE,
            button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
            button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
            button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
          },
        });
      }
      const resObj = {
        status: 200,
        success: true,
        message: 'sucessfully',
        data: null,
      };
      return res.send(resObj);
    } else {
      throw new Errors.UnknownError('Unable user in table seats');
    }
  } catch (error) {
    Logger.error('multipleLoginHandler :>> ', error);
    const resObj = {
      status: 400,
      message: 'oops ! Something want wrong',
      data: null,
    };
    return res.send(resObj);
  }
}

export = multipleLoginHandler;
