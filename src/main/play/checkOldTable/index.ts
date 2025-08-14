import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import Errors from '../../errors';
import {
  EVENTS,
  MESSAGES,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
} from '../../../constants';
import {signUpRequestIf} from '../../interface/requestIf';
import {
  getRoundTableData,
  getTableData,
  getUser,
  setUser,
} from '../../gameTable/utils';
import leaveTable from '../leaveTable';
import {userIf} from '../../interface/userSignUpIf';

async function checkOldTableExist(
  socket: any,
  signUpData: signUpRequestIf,
  ack?: (response: any) => void,
) {
  const {userId} = signUpData;
  const socketId = socket.id;

  try {
    logger.info(
      userId,
      `Starting checkOldTableExist for userId : ${userId}, socket.authToken : ${socket.authToken}`,
      'signUpData :: ',
      signUpData,
    );
    let isUserJoinOtherLobby = false;

    const userData: userIf = await getUser(userId);
    if (!userData) {
      return isUserJoinOtherLobby;
    }
    userData.authToken = socket.authToken;
    await setUser(userId, userData);

    const userDetail: userIf = await getUser(userId);
    if (!userDetail) {
      return isUserJoinOtherLobby;
    }

    logger.info(userId, 'get userDetail :==>> ', userDetail);
    logger.info(userId, ' signUpData :==>> ', signUpData);

    if (signUpData.lobbyId !== userDetail?.lobbyId) {
      if (userDetail.tableId) {
        const tableData = await getTableData(userDetail.tableId);
        if (!tableData) {
          return isUserJoinOtherLobby;
        }

        const roundTableData = await getRoundTableData(
          userDetail.tableId,
          tableData.currentRound,
        );
        if (!roundTableData) {
          return isUserJoinOtherLobby;
        }

        if (roundTableData.tableState !== TABLE_STATE.SCOREBOARD_DECLARED) {
          isUserJoinOtherLobby = true;
          const nonProdMsg = `REJOIN PREVIOUS TABLE?`;
          CommonEventEmitter.emit(EVENTS.REJOIN_POPUP_SOCKET_EVENT, {
            socket: socketId,
            data: {
              title: nonProdMsg,
              message: MESSAGES.ERROR.REJOIN_PREVIOUS_TABLE,
              button_text: [
                MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.REJOIN,
                MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NEW_GAME,
              ],
              rejoinUserData: {
                acessToken: userDetail.authToken,
                minPlayer: userDetail.minPlayer,
                noOfPlayer: userDetail.noOfPlayer,
                lobbyId: userDetail.lobbyId,
                isUseBot: userDetail.isUseBot,
                entryFee: userDetail.entryFee,
                moneyMode: userDetail.moneyMode,
                totalRound: userDetail.totalRound,
                winningAmount: userDetail.winningAmount,
                userName: userDetail.username,
                userId: userDetail.userId,
                profilePic: userDetail.profilePicture,
                gameId: userDetail.gameId,
                isFTUE: userDetail.isFTUE,
                fromBack: userDetail.fromBack,
                deviceId: userDetail.deviceId,
              },
            },
          });
        } else {
          await leaveTable(tableData._id, PLAYER_STATE.LEFT, socket, ack).catch(
            (e: any) =>
              logger.error(userId, 'checkOldTableExist : leaveTablbe =>', e),
          );
        }
      }
    }
    logger.info(
      userId,
      `Ending checkOldTableExist for userId : ${userId}`,
      'isUserJoinOtherLobby :: ==>',
      isUserJoinOtherLobby,
    );

    return isUserJoinOtherLobby;
  } catch (error: any) {
    logger.error(
      userId,
      '<<======= checkOldTableExist() Error ======>>',
      error,
    );

    // let msg = MESSAGES.ERROR.COMMON_ERROR;
    // let nonProdMsg = "";
    // let errorCode = 500;

    // if (error instanceof Errors.InvalidInput) {
    //     nonProdMsg = "Invalid Input";
    //     CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
    //         socket: socketId,
    //         data: {
    //             isPopup: true,
    //             popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
    //             title: nonProdMsg,
    //             message: msg,
    //             buttonCounts: NUMERICAL.ONE,
    //             button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
    //             button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
    //             button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
    //         },
    //     });
    // } else if (error instanceof Errors.UnknownError) {
    //     nonProdMsg = "FAILED";

    //     CommonEventEmitter.emit(EVENTS.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
    //         socket: socketId,
    //         data: {
    //             isPopup: true,
    //             popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
    //             title: nonProdMsg,
    //             message: msg,
    //             buttonCounts: NUMERICAL.ONE,
    //             button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
    //             button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
    //             button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
    //         },
    //     });
    // }

    throw new Error(`function  checkOldTableExist error ${error}`);
  }
}

export = checkOldTableExist;
