import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import {
  getPlayerGamePlay,
  getRejoinTableHistory,
  removeRejoinTableHistory,
} from '../../gameTable/utils';
import {EVENTS, MESSAGES, NUMERICAL, PRODUCTION} from '../../../constants';
import rejoinPlayingTable from './index';
import {playerPlayingDataIf} from '../../interface/playerPlayingTableIf';
import socketAck from '../../../socketAck';

// check Player Back in game from Back_Ground
const rejoinPlayingTablePopUp = async (
  userId: string,
  gameId: string,
  lobbyId: string,
  roomFlag: boolean,
  isFTUE: boolean,
  socket: any,
  ack?: (response: any) => void,
) => {
  const {getLock} = global;
  let tableId = '';
  const rejoinPlayingTablePopUpLock = await getLock.acquire([userId], 2000);
  try {
    const {
      getConfigData: {
        REJOIN_POP_REASON,
        REJOIN_END_GAME_REASON,
        BEFORE_GAME_START_LEAVE_REASON,
        FTUE_DISCONNECT_POP_REASON,
      },
    } = global;

    logger.info(
      userId,
      'rejoinPlayingTablePopUp :==>> ',
      userId,
      gameId,
      lobbyId,
    );
    const rejoinPlayData = await getRejoinTableHistory(userId, gameId, lobbyId);

    logger.info(
      userId,
      'rejoinPlayingTablePopUp :: :: rejoinPlayData :: ',
      rejoinPlayData,
    );

    // handle re-join for FTUE
    if (isFTUE) {
      logger.info(
        userId,
        'rejoinPlayingTablePopUp : client disconnect on FTUE :-:',
      );

      const sendEventData = {
        statusFlag: true,
        message: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_MESSAGE,
        reason: FTUE_DISCONNECT_POP_REASON
          ? FTUE_DISCONNECT_POP_REASON
          : 'You have been removed from this table because of your inactivity from a long time. Please exit and join again. Thank you!',
        type: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE,
        title: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TITLE,
        buttonCount: NUMERICAL.ONE,
        button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
        button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
        button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        showLoader: false,
      };

      throw sendEventData;
    } else if (!rejoinPlayData) {
      logger.info(
        userId,
        'rejoinPlayingTablePopUp : send event to client your are alerdy leave this table :-:',
        'rejoinPlayingTablePopUp : create new table in rejoin.',
      );
      return true;
      // const sendEventData = {
      //   statusFlag: true,
      //   message: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_MESSAGE,
      //   reason: MESSAGES.ERROR.EXISTING_TABLE_IS_DESTROYED,
      //   type: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE,
      //   title: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TITLE,
      //   buttonCount: NUMERICAL.ONE,
      //   button_text: [
      //     MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT,
      //     /*MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.YES, MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NO*/
      //   ],
      //   button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
      //   button_methods: [
      //     MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT,
      //     /*MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.YES, MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.NO*/
      //   ],
      //   showLoader: false,
      // };
      // // CommonEventEmitter.emit(EVENTS.REJOIN_SOCKET_EVENT, {
      // //   socket,
      // //   data: sendEventData,
      // // });
      // throw sendEventData;
    } else {
      tableId = rejoinPlayData.tableId;
      const userPlayingTable: playerPlayingDataIf = await getPlayerGamePlay(
        userId,
        tableId,
      );
      logger.info(
        userId,
        'rejoinPlayingTablePopUp : userPlayingTable :: ',
        userPlayingTable,
      );

      if (!userPlayingTable) {
        const gameEndFlag = rejoinPlayData.isEndGame;
        let sendEventData;
        if (gameEndFlag) {
          logger.info(
            userId,
            'rejoinPlayingTablePopUp : send End Game Message',
          );
          // Send End Game Message
          sendEventData = {
            statusFlag: true,
            message: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_MESSAGE,
            reason: REJOIN_END_GAME_REASON,
            type: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE,
            title: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TITLE,
            buttonCount: NUMERICAL.TWO,
            button_text: [
              MESSAGES.ALERT_MESSAGE.BUTTON_TEXT
                .EXIT /* MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NO*/,
              MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NEW_GAME,
            ],
            button_color: [
              MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED,
              MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.GREEN,
            ],
            button_methods: [
              MESSAGES.ALERT_MESSAGE.BUTTON_METHOD
                .EXIT /* MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.NO*/,
              MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.YES,
            ],
            showLoader: false,
          };
          // CommonEventEmitter.emit(EVENTS.REJOIN_SOCKET_EVENT, {
          //   socket,
          //   data: sendEventData,
          // });
          // return false;
        } else {
          logger.info(
            userId,
            'rejoinPlayingTablePopUp : create new table in rejoin :-: ',
          );
          sendEventData = {
            statusFlag: true,
            message: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_MESSAGE,
            reason: REJOIN_POP_REASON,
            type: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE,
            title: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TITLE,
            buttonCount: NUMERICAL.ONE,
            button_text: [
              MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT,
              /*MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.YES, MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NO*/
            ],
            button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
            button_methods: [
              MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT,
              /*MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.YES, MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.NO*/
            ],
            showLoader: false,
          };
          // CommonEventEmitter.emit(EVENTS.REJOIN_SOCKET_EVENT, {
          //   socket,
          //   data: sendEventData,
          // });
        }
        throw sendEventData;
      } else {
        const gameEndFlag = rejoinPlayData.isEndGame;
        if (userPlayingTable.isLeft) {
          logger.info(
            userId,
            'rejoinPlayingTablePopUp : send event to client your are alerdy leave this table for timeout resoun :: -----',
          );
          const sendEventData = {
            statusFlag: true,
            message: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_MESSAGE,
            reason: REJOIN_POP_REASON,
            type: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE,
            title: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TITLE,
            buttonCount: NUMERICAL.ONE,
            button_text: [
              MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT,
              /*MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.YES, MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NO*/
            ],
            button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
            button_methods: [
              MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT,
              /*MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.YES, MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.NO*/
            ],
            showLoader: false,
          };
          // CommonEventEmitter.emit(EVENTS.REJOIN_SOCKET_EVENT, {
          //   socket,
          //   data: sendEventData,
          // });
          throw sendEventData;
        } else if (gameEndFlag) {
          logger.info(
            userId,
            'rejoinPlayingTablePopUp : send End Game Message.',
          );
          // Send End Game Message
          const sendEventData = {
            statusFlag: true,
            message: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_MESSAGE,
            reason: REJOIN_END_GAME_REASON,
            type: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE,
            title: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TITLE,
            buttonCount: NUMERICAL.TWO,
            button_text: [
              MESSAGES.ALERT_MESSAGE.BUTTON_TEXT
                .EXIT /* MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NO*/,
              MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NEW_GAME,
            ],
            button_color: [
              MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED,
              MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.GREEN,
            ],
            button_methods: [
              MESSAGES.ALERT_MESSAGE.BUTTON_METHOD
                .EXIT /* MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.NO*/,
              MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.YES,
            ],
            showLoader: false,
          };
          // CommonEventEmitter.emit(EVENTS.REJOIN_SOCKET_EVENT, {
          //   socket,
          //   data: sendEventData,
          // });
          throw sendEventData;
        } else {
          logger.info(
            userId,
            'rejoinPlayingTablePopUp : rejoin success fulliy ---11-',
          );
          rejoinPlayingTable(
            userId,
            rejoinPlayData.tableId,
            roomFlag,
            socket,
            false,
            ack,
          );
        }
      }
    }
    return false;
  } catch (error: any) {
    logger.error(
      userId,
      `CATCH_ERROR : rejoinPlayingTablePopUp :: userId : ${userId} :: gameId : ${gameId} :: lobbyId:${lobbyId} :: `,
      error,
    );
    if (error && error.type === MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE) {
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: error.title,
          message: error.reason,
          buttonCounts: error.buttonCount,
          button_text: error.button_text,
          button_color: error.button_color,
          button_methods: error.button_methods,
          showLoader: error.showLoader,
        },
      });
    }
    if (ack) {
      socketAck.ackMid(
        EVENTS.SIGN_UP_SOCKET_EVENT,
        {
          success: false,
          error: {
            errorCode: 401,
            errorMessage:
              process.env.NODE_ENV === PRODUCTION
                ? error.reason
                : error && error.reason && typeof error.reason === 'string'
                  ? error.reason
                  : 'Rejoin Fail',
          },
        },
        // socket.metrics,
        socket.userId,
        tableId,
        ack,
      );
    }
    return false;
  } finally {
    await getLock.release(rejoinPlayingTablePopUpLock);
  }
};
// cancel Rejoin Playing Timer
const cancelRejoinPlayingTimer = async (
  tableId: string,
  userId: string,
  gameId: string,
  lobbyId: string,
) => {
  try {
    await removeRejoinTableHistory(userId, gameId, lobbyId);
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : cancelRejoinPlayingTimer : tableId : ${tableId} :: userId : ${userId} :: gameId : ${gameId} :: lobbyId:${lobbyId} :: `,
      e,
    );
  }
};

const exportObject = {
  rejoinPlayingTablePopUp,
  cancelRejoinPlayingTimer,
};
export = exportObject;
