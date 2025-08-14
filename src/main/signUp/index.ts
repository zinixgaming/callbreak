import logger from '../logger';
import {EMPTY, EVENTS, MESSAGES, NUMERICAL} from '../../constants';
import DefaultDataGenerator from '../defaultData';
import {insertNewPlayer} from '../gameTable';
import {userSignUpIf, userIf} from '../interface/userSignUpIf';
import socketAck from '../../socketAck';
import {setUser, getUser} from '../gameTable/utils';
import {checkBalance, getUserOwnProfile} from '../clientsideapi';
import CommonEventEmitter from '../commonEventEmitter';
import Errors from '../errors';
import userProfileUpdate from './userProfileUpdate';

const setDataForUpdate = (signUpData: userIf) => {
  console.log(signUpData.userId, 'signUpData.tableid :>> ', signUpData.tableId);
  const currentTimestamp = new Date();
  const updateData = {
    _id: signUpData._id,
    isFTUE: signUpData.isFTUE,
    username: signUpData.username,
    deviceId: signUpData.deviceId,
    socketId: signUpData.socketId,
    lobbyId: signUpData.lobbyId.toString(),
    gameId: signUpData.gameId,
    startTime: signUpData.startTime,
    balance: signUpData.balance,
    userId: signUpData.userId,
    tableId: signUpData.tableId ? signUpData.tableId : EMPTY,
    profilePicture: signUpData.profilePicture,
    totalRound: signUpData.totalRound,
    minPlayer: signUpData.minPlayer,
    noOfPlayer: signUpData.noOfPlayer,
    winningAmount: signUpData.winningAmount,
    rake: signUpData.rake,
    gameStartTimer: signUpData.gameStartTimer,
    userTurnTimer: signUpData.userTurnTimer,
    entryFee: signUpData.entryFee,
    authToken: signUpData.authToken,
    longitude: signUpData.longitude,
    latitude: signUpData.latitude,
    fromBack: signUpData.fromBack,
    isUseBot: signUpData.isUseBot,
    isBot: signUpData.isBot,
    moneyMode: signUpData.moneyMode,
    isAnyRunningGame: signUpData.isAnyRunningGame,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
  };

  return updateData;
};

async function findOrCreateUser(signUpData: userIf) {
  const {userId} = signUpData;
  // const keyForUser = `${PREFIX.USER}:${userId}`;
  let userInfo = await getUser(userId);

  logger.info(userId, 'findOrCreateUser : userInfo :: ', userInfo);
  if (userInfo) {
    signUpData._id = userInfo._id;
    signUpData.tableId = userInfo.tableId;
    logger.info(
      userId,
      'findOrCreateUser : userInfo is avalible :: ',
      userInfo,
    );
    // updating the user info

    const userProfileUpdateQuery: userIf = setDataForUpdate(signUpData);

    logger.info(
      userId,
      'findOrCreateUser : userProfileUpdateQuery ::',
      userProfileUpdateQuery,
    );
    // update user info
    await setUser(userId, userProfileUpdateQuery);
  } else {
    logger.info(userId, 'findOrCreateUser : create data :: ');

    // create new user
    const userDefaultData: userIf =
      DefaultDataGenerator.defaultUserData(signUpData);

    logger.info(
      userId,
      'findOrCreateUser : userDefaultData :: ',
      userDefaultData,
    );
    // add user info
    await setUser(userId, userDefaultData);
    userInfo = await getUser(userId);
    logger.info(userId, 'findOrCreateUser : Create USer :: ', userInfo);
  }

  return userInfo;
}

async function userSignUp(
  data: userSignUpIf,
  socket: any,
  ack?: (response: any) => void,
) {
  const {getLock} = global;
  const signUpLock = await getLock.acquire([data.userId], 2000);
  const {userId} = data;
  try {
    const signUpData = {...data, socketId: socket.id};
    logger.info(userId, 'signUpData  =:>> ', signUpData);

    const userData: userIf = await findOrCreateUser(signUpData);
    userData.fromBack = signUpData.fromBack;

    signUpData._id = userData._id;
    socket.eventMetaData = {
      userId: userData.userId,
      userObjectId: userData._id,
    };

    let userDetail = <userIf>{};
    let updatedUserDetail;
    if (userData) {
      userDetail = await getUser(userData.userId);
      logger.info(userId, 'userDetail :: >> ', userDetail);

      //update user profile details userId
      await userProfileUpdate(userDetail, userData.socketId);
      updatedUserDetail = await getUser(userData.userId);

      if (userDetail && userDetail.tableId === EMPTY) {
        //check user balance
        let checkBalanceDetail: any = {};
        checkBalanceDetail = await checkBalance(
          {tournamentId: userDetail.lobbyId},
          userDetail.authToken,
          userData.socketId,
          userDetail.userId,
        );
        logger.info(userId, 'checkBalanceDetail  :: >> ', checkBalanceDetail);
        if (
          checkBalanceDetail &&
          checkBalanceDetail.userBalance.isInsufficiantBalance
        ) {
          console.log(
            'isInsufficiantBalance ::',
            checkBalanceDetail.userBalance.isInsufficiantBalance,
          );
          const nonProdMsg = 'Insufficient Balance!';
          CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
            socket,
            data: {
              isPopup: true,
              popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
              title: nonProdMsg,
              message: MESSAGES.ERROR.INSUFFICIENT_BALANCE,
              buttonCounts: NUMERICAL.ONE,
              button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
              button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
              button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
            },
          });
        } else if (
          checkBalanceDetail &&
          checkBalanceDetail.userBalance.isInsufficiantBalance === false
        ) {
          insertNewPlayer(updatedUserDetail, socket, ack);
        } else {
          throw new Errors.UnknownError('Unable to check Balance data');
        }
      } else {
        logger.info(
          userId,
          'rejoin user insert in table :::> updatedUserDetail ::  tableId: ',
          updatedUserDetail.tableId,
        );
        insertNewPlayer(updatedUserDetail, socket, ack);
      }
    }
  } catch (error) {
    logger.error(userId, 'CATCH_ERROR :userSignUp :: ', data, error);

    socketAck.ackMid(
      EVENTS.SIGN_UP_SOCKET_EVENT,
      {
        success: false,
        error: {
          errorCode: 500,
          errorMessage: MESSAGES.ERROR.COMMON_ERROR,
        },
      },
      // socket.metrics,
      socket.userId,
      '',
      ack,
    );
  } finally {
    await getLock.release(signUpLock);
  }
}

const exportObject = {
  userSignUp,
};
export = exportObject;
