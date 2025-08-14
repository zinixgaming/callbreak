import logger from "../../logger";
import UserProfile from "../../signUp";
import {
  ACKNOWLEDGE_EVENT,
  EMPTY,
  EVENTS,
  FTUE_BOT,
  MESSAGES,
  NUMERICAL,
  POPUP_TITLE,
  PRODUCTION,
} from "../../../constants";
import socketAck from "../../../socketAck";
import CommonEventEmitter from "../../commonEventEmitter";
import { signUpHelperRequestIf } from "../../interface/requestIf";
import Validator from "../../Validator";
import Errors from "../../errors";
import { getRandomNumber } from "../../FTUE/common";
import { getConfig } from "../../../config";
import { checkMaintanence, firstTimeIntrection, verifyUserProfile } from "../../clientsideapi";
import checkOldTableExist from "../../play/checkOldTable";
const { GAME_TURN_TIMER, GAME_START_TIMER, FTUE_UPDATE } = getConfig();


async function signUpHandler(
  { data: signUpData }: signUpHelperRequestIf,
  isRejoinOrNewGame: boolean,
  socket: any,
  ack?: Function
) {
  const { getConfigData: config } = global;
  const socketId = socket.id;
  const { userId } = signUpData;
  try {
    logger.info(userId, "socket.authToken :::", socket.authToken, "socketId ::", socketId);

    /**
    * Check auth token is valid or not 
    */
    let checkMaintanenceData = await checkMaintanence(socket.authToken, socketId, userId);
    logger.info("checkMaintanenceData :::", checkMaintanenceData);
    if (checkMaintanenceData && checkMaintanenceData.isMaintenance) {
      throw new Errors.maintanenceError('Server under the maintenance!');
    }

    let isValidUserData = await verifyUserProfile(socket.authToken, signUpData.gameId, socketId, userId);
    logger.info(userId, "isValidUserData :: >> ", isValidUserData);

    signUpData = await Validator.requestValidator.signUpValidator(signUpData);
    let data;

    socket.userId = signUpData.userId;
    if (signUpData.isFTUE) {
      await firstTimeIntrection(signUpData.gameId, signUpData.gameModeId, socket.authToken, socketId, userId);
      signUpData.isFTUE = false;
    }

    // if(isRejoinOrNewGame){   
    //   const isUserJoinOtherLobby = await checkOldTableExist(socket, signUpData, ack);
    //   if(isUserJoinOtherLobby){
    //     return false;
    //   }
    // }
    data = {
      _id: "",
      isFTUE: signUpData.isFTUE /*&& config.FTUE.IS_FTUE*/
        ? signUpData.isFTUE
        : false,
      username:
        typeof signUpData.userName !== "undefined" ? signUpData.userName : "",
      deviceId:
        typeof signUpData.deviceId !== "undefined" ? signUpData.deviceId : "",
      fromBack: signUpData.fromBack ? signUpData.fromBack : false,
      lobbyId: signUpData.lobbyId
        ? signUpData.isFTUE /* && config.FTUE.IS_FTUE */
          ? getRandomNumber(1111, 9999).toString()
          : signUpData.lobbyId
        : NUMERICAL.ZERO.toString(),
      gameId:
        typeof signUpData.gameId !== "undefined"
          ? signUpData.isFTUE /* && config.FTUE.IS_FTUE */
            ? getRandomNumber(1111, 9999)
            : signUpData.gameId
          : NUMERICAL.ONE,
      startTime: NUMERICAL.ZERO,
      balance: NUMERICAL.ZERO,
      userId: socket.userId,
      totalRound: signUpData.totalRound
        ? signUpData.totalRound
        : NUMERICAL.FOUR,
      profilePicture:
        typeof signUpData.profilePic !== "undefined" &&
          signUpData.profilePic !== ""
          ? signUpData.profilePic
          : "",
      minPlayer:
        typeof signUpData.minPlayer !== "undefined" ? signUpData.minPlayer : "",
      noOfPlayer:
        typeof signUpData.noOfPlayer !== "undefined" ? signUpData.noOfPlayer : "",
      winningAmount:
        typeof signUpData.winningAmount !== "undefined"
          ? signUpData.winningAmount
          : "",
      rake: typeof signUpData.rake !== "undefined" ? signUpData.rake : "",
      gameStartTimer: Number(GAME_START_TIMER) || NUMERICAL.TEN,
      userTurnTimer: Number(GAME_TURN_TIMER) || NUMERICAL.TEN,
      tableId: EMPTY,
      entryFee: signUpData.isFTUE ? NUMERICAL.ZERO : signUpData.entryFee,
      authToken: socket.authToken,
      isUseBot: signUpData.isUseBot,
      isBot: false,
      moneyMode: signUpData.moneyMode,
      isAnyRunningGame: (isValidUserData && isValidUserData.isValidUser) ? isValidUserData.isAnyRunningGame : false,
      latitude : signUpData?.latitude,
      longitude: signUpData?.longitude,
    };

    return UserProfile.userSignUp(data, socket, ack).catch((e: any) =>
      logger.error(userId, e)
    );
  } catch (error: any) {
    logger.error(userId, "CATCH_ERROR : signUpHandler ::", signUpData, error);

    let msg = config.COMMON_ERROR
      ? config.COMMON_ERROR
      : MESSAGES.ERROR.COMMON_ERROR;
    let nonProdMsg = "";
    let errorCode = 500;

    if (error instanceof Errors.maintanenceError) {
      let nonProdMsg = "Server under the maintenance!";
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
    }else if (error instanceof Errors.InvalidInput) {
      nonProdMsg = "Invalid Input";
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          message: config.COMMON_ERROR
            ? config.COMMON_ERROR
            : MESSAGES.ERROR.COMMON_ERROR,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else if (error instanceof Errors.UnknownError) {
      nonProdMsg = "GRPC_FAILED";

      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: config.COMMON_ERROR
            ? config.COMMON_ERROR
            : MESSAGES.ERROR.COMMON_ERROR,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else {
      socketAck.ackMid(
        EVENTS.SIGN_UP_SOCKET_EVENT,
        {
          success: false,
          error: {
            errorCode,
            errorMessage:
              process.env.NODE_ENV === PRODUCTION
                ? msg
                : error && error.message && typeof error.message === "string"
                  ? error.message
                  : nonProdMsg,
          },
        },
        // socket.metrics,
        socket.userId,
        "", // signUpData.tableId || '',
        ack
      );
    }
  }
}

export = signUpHandler;
