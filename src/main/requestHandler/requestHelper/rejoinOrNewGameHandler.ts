import logger from "../../logger";
import Errors from "../../errors";
import { signUpRequestIf, userRejoinHelperRequestIf } from "../../interface/requestIf";
import { getPlayerGamePlay, getRoundTableData, getTableData, getUser } from "../../gameTable/utils";
import { EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE } from "../../../constants";
import signUpHandler from "./signUp";
import CommonEventEmitter from "../../commonEventEmitter";
import leaveTable from "../../play/leaveTable";
import { formatGameTableInfo, formatSingUpInfo } from "../../play/helpers/playHelper";
import userRejoinHelper from "./userRejoin";
import userRejoin from "../../signUp/userRejoin";
import { rejoinIf } from "../../interface/userSignUpIf";
import { leaveClientInRoom } from "../../socket";


async function rejoinOrNewGameHandler(rejoinOrNewGameData: signUpRequestIf, socket: any, ack?: Function,): Promise<boolean | any | undefined> {
    const socketId = socket.id;
    const userId = rejoinOrNewGameData.userId;
    // let tempSignUpData = JSON.parse(rejoinOrNewGameData.signUpData);
    const signUpDetails: signUpRequestIf = rejoinOrNewGameData;
    logger.info(userId, 'signUpData :===>>>> ', signUpDetails, socketId);

    try {
        logger.info(userId, `Starting rejoinOrNewGameHandler :>> `);
        // logger.info(`rejoinOrNewGameData ::> ${JSON.stringify(rejoinOrNewGameData)}`);

        let userProfileData = await getUser(signUpDetails.userId);
        if (!userProfileData) throw new Errors.UnknownError('get user details');
        logger.info(userId, "===userProfileData===", userProfileData)

        if (signUpDetails.isAlredyPlaying) {

            if (userProfileData && userProfileData.tableId) {

                //rejoin event
                const data : rejoinIf= {
                    fromBack: true,
                    userId : userProfileData.userId
                  };
                logger.info(userId, 'data :>> ', data);
                userRejoin(data, socket, ack).catch((e: any) => logger.error(e));

            } else {
                logger.info(userId, 'rejoinOrNewGameHandler  not working');
                throw new Errors.UnknownError('rejoinOrNewGameHandler  not working');
            }

        } else {
            const isRejoinOrNewGame = false;
            // const isAlreadyPlay : boolean = true;
            if (userProfileData && userProfileData.tableId) {

                socket.eventMetaData = {
                    userObjectId: userProfileData._id,
                    tableId: userProfileData.tableId,
                    userId: userProfileData.userId,
                  }

                await leaveClientInRoom(socket, userProfileData.tableId);
                await leaveTable(userProfileData.tableId, PLAYER_STATE.LEFT, socket, ack).catch(
                    (e: any) => logger.error(userId, "checkOldTableExist : leaveTablbe =>", e),
                );

            }
            let response: any = await signUpHandler({ data: signUpDetails }, isRejoinOrNewGame, socket, ack);
            logger.info(userId, "Before Join Table : response :: ==>>", response);
        }
        logger.info(userId, ` Ending rejoinOrNewGameHandler :>> `);

        return true;
    }
    catch (error: any) {
        logger.error(userId, `rejoinOrNewGameHandler Error :: ${error}`)

        let msg = MESSAGES.ERROR.COMMON_ERROR;
        let nonProdMsg = "";
        let errorCode = 500;

        if (error instanceof Errors.InvalidInput) {
            nonProdMsg = "Invalid Input";
            CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: msg,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        } else if (error instanceof Errors.UnknownError) {
            nonProdMsg = "FAILED";

            CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
                socket: socketId,
                data: {
                    isPopup: true,
                    popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
                    title: nonProdMsg,
                    message: msg,
                    buttonCounts: NUMERICAL.ONE,
                    button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
                    button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
                    button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
                },
            });
        } else {
            CommonEventEmitter.emit(EVENTS.REJOIN_OR_NEW_GAME_SOCKET_EVENT, {
                socket: socketId,
                data: {
                    success: false,
                    error: {
                        errorCode,
                        errorMessage: error && error.message && typeof error.message === "string"
                            ? error.message
                            : nonProdMsg,
                    },
                }
            });
        }
    }
}

export = rejoinOrNewGameHandler;

