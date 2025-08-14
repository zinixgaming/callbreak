import {
  BOT,
  ERROR_TYPE,
  MESSAGES,
  NUMERICAL,
} from '../../../constants';
import { getOneRobot } from '../../clientsideapi';
import {
  getRoundTableData,
  getTableData,
  getUser,
} from '../../gameTable/utils';
import { botDbDataIf, botGameConfigIf } from '../../interface/botIf';
import { getBotIf } from '../../interface/cmgApiIf';
import { playingTableIf } from '../../interface/playingTableIf';
import { roundTableIf } from '../../interface/roundTableIf';
import { throwErrorIF } from '../../interface/throwError';
import logger from '../../logger';
import { userSignUp } from '../../signUp';

async function findBot(tableId: string, gameConfig: botGameConfigIf) {
  logger.info('call find bot ::: ');
  const { getLock } = global;
  const findRobotLock = await getLock.acquire([tableId], 2000);
  try {
    const playingTable: playingTableIf = await getTableData(tableId);

    if (playingTable === null) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.LEAVE_TABLE_CARD_ERROR,
        message: MESSAGES.ERROR.TABLE_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }
    const { currentRound } = playingTable;
    const roundPlayingTable: roundTableIf = await getRoundTableData(
      tableId,
      currentRound,
    );

    const userIds: string[] = [];
    for (const key in roundPlayingTable.seats) {
      if (
        Object.prototype.hasOwnProperty.call(roundPlayingTable.seats, key) &&
        Object.keys(roundPlayingTable.seats[key]).length !== 0
      ) {
        const element = roundPlayingTable.seats[key];
        userIds.push(element.userId);
      }
    }

    const userDetail = await getUser(userIds[0]);
    if (userDetail === null || userIds.length == 0) {
      const errorObj: throwErrorIF = {
        type: ERROR_TYPE.LEAVE_TABLE_CARD_ERROR,
        message: MESSAGES.ERROR.USER_DETAIL_NOT_FOUND_ERROR_MESSAGES,
        isToastPopup: true,
      };
      throw errorObj;
    }

    const botUserData: getBotIf = await getOneRobot(userDetail.lobbyId, userDetail.authToken, userDetail.userId) as getBotIf;
    logger.info('botUserData :------>> ' + botUserData);

    if (!botUserData.isBotAvailable) {
      return true;
    }

    const botUser = botUserData.botDetails;
    if (botUser) {
      const botData = {
        _id: botUser._id,
        isFTUE: false,
        username: botUser.fullName,
        deviceId: '',
        fromBack: false,
        lobbyId: gameConfig.lobbyId,
        gameId: gameConfig.gameId,
        startTime: NUMERICAL.ZERO,
        balance: (botUser?.winCash || 0) + (botUser?.cash || 0),
        userId: botUser._id,
        tableId: "",
        profilePicture: botUser.profileImage || "",
        totalRound: playingTable.totalRounds,
        minPlayer: gameConfig.minPlayer,
        noOfPlayer: gameConfig.noOfPlayer,
        winningAmount: playingTable.winningAmount,
        rake: "",
        gameStartTimer: gameConfig.gameStartTimer,
        userTurnTimer: gameConfig.userTurnTimer,
        entryFee: gameConfig.entryFee,
        longitude: "0.0",
        latitude: "0.0",
        authToken: botUser.token || "",
        isUseBot: true,
        isBot: true,
        inPlay: false,
        moneyMode: "moneyMode",
        isAnyRunningGame: false
      };

      await userSignUp(botData, { id: BOT.ID, tableId });
      // const getBotData = await getUser(botDetail[0].userId);

      // // insert new player in table
      // insertNewPlayer(getBotData, { id: BOT.ID, tableId });
    }

  } catch (error) {
    logger.error('CATCH_ERROR : findBot :: ', tableId, error);
    return false;
  } finally {
    await getLock.release(findRobotLock);
    return false;
  }
}

export = findBot;

