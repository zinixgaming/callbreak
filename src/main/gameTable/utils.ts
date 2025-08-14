import logger from '../logger';
import redis from '../redis';
import {PREFIX} from '../../constants/redis';
import {
  playingTableIf,
  RejoinTableHistoryIf,
} from '../interface/playingTableIf';
import {roundTableIf} from '../interface/roundTableIf';
import {playerPlayingDataIf} from '../interface/playerPlayingTableIf';
import Errors from '../errors';
import {userIf} from '../interface/userSignUpIf';
import Validator from '../Validator';
import {optionsIf, updateObjIf} from '../interface/startRoundIf';
import {
  AllBidTurnHistory,
  AllturnHistory,
  roundDetailsInterface,
} from '../interface/turnHistoryIf';
import {NUMERICAL} from '../../constants';

// playerGamePlay functions
const setPlayerGamePlay = async (
  userId: string,
  tableId: string,
  data: playerPlayingDataIf,
) => {
  try {
    data = await Validator.methodValidator.playerGamePlayValidator(data);
    await redis.commands.setValueInKeyWithExpiry(
      `${PREFIX.PLAYER}:${userId}:${tableId}`,
      data,
    );

    return userId;
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : setPlayerGamePlay :: userId : ${userId} :: tableId : ${tableId} :: `,
      data,
      e,
    );
    throw e;
  }
};

const getPlayerGamePlay = async (
  userId: string,
  tableId: string,
): Promise<playerPlayingDataIf> => {
  try {
    return redis.commands.getValueFromKey(
      `${PREFIX.PLAYER}:${userId}:${tableId}`,
    );
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : getPlayerGamePlay :: userId : ${userId} :: tableId : ${tableId} :: `,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
};

const removePlayerGameData = async (userId: string, tableId: string) => {
  try {
    return redis.commands.deleteKey(`${PREFIX.PLAYER}:${userId}:${tableId}`);
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : removePlayerGameData :: userId : ${userId} :: tableId : ${tableId} :: `,
      e,
    );

    throw new Errors.CancelBattle(e);
  }
};

// tableData functions
const setTableData = async (data: playingTableIf) => {
  try {
    data = await Validator.methodValidator.playingTableValidator(data);
    const {_id: tableId} = data;
    const key = `${PREFIX.GAME_TABLE}:${tableId}`;
    await redis.commands.setValueInKeyWithExpiry(key, data);

    return tableId;
  } catch (e) {
    logger.error(
      `CATCH_ERROR : setTableData :: tableId : ${data._id} :: `,
      data,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
};

const getTableData = async (tableId: string): Promise<playingTableIf> => {
  try {
    return redis.commands.getValueFromKey(`${PREFIX.GAME_TABLE}:${tableId}`);
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : getTableData :: tableId : ${tableId} :: `,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
};

const removeTableData = async (tableId: string) =>
  redis.commands.deleteKey(`${PREFIX.GAME_TABLE}:${tableId}`);

// Round Table functions
const setRoundTableData = async (
  tableId: string,
  roundNo: number,
  data: roundTableIf,
) => {
  try {
    data = await Validator.methodValidator.roundTableValidator(data);
    const key = `${PREFIX.ROUND}:${tableId}:${roundNo}`;
    await redis.commands.setValueInKeyWithExpiry(key, data);

    return tableId;
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : setRoundTableData :: tableId: ${tableId} :: roundNo: ${roundNo}`,
      data,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
};

async function updateRoundTableData(
  tableGameData: roundTableIf,
  updateObj: updateObjIf,
  options: optionsIf,
) {
  try {
    const {currentRound, tableId} = options;

    const key = `${PREFIX.ROUND}:${tableId}:${currentRound}`;

    await Validator.methodValidator.roundTableValidator({
      ...tableGameData,
      ...updateObj,
    });

    redis.commands.setValueInKey(key, {...tableGameData, ...updateObj});
  } catch (e) {
    logger.error(
      options.tableId,
      'CATCH_ERROR : updateRoundTableData :: ',
      tableGameData,
      updateObj,
      options,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
}

const getRoundTableData = async (
  tableId: string,
  roundNo: number,
): Promise<roundTableIf> => {
  try {
    return redis.commands.getValueFromKey(
      `${PREFIX.ROUND}:${tableId}:${roundNo}`,
    );
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : getRoundTableData :: tableId: ${tableId} :: roundNo: ${roundNo}`,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
};

const removeRoundTableData = async (tableId: string, roundNo: number) =>
  redis.commands.deleteKey(`${PREFIX.ROUND}:${tableId}:${roundNo}`);

// Turn History Function
const getTurnHistory = (
  tableId: string,
  roundNo: number,
): Promise<roundDetailsInterface> => {
  try {
    return redis.commands.getValueFromKey(
      `${PREFIX.TURN_HISTORY}:${tableId}:${roundNo}`,
    );
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : getTurnHistory :: tableId: ${tableId} :: roundNo: ${roundNo} `,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
};
const setTurnHistory = (tableId: string, roundNo: number, value: any) => {
  try {
    const key = `${PREFIX.TURN_HISTORY}:${tableId}:${roundNo}`;
    return redis.commands.setValueInKeyWithExpiry(key, value);
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : setTurnHistory :: tableId: ${tableId} :: roundNo: ${roundNo} `,
      value,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
};

const removeTurnHistory = (tableId: string, roundNo: number) =>
  redis.commands.deleteKey(`${PREFIX.TURN_HISTORY}:${tableId}:${roundNo}`);

// Bit Turn History Function
const getBidTurnHistory = (
  tableId: string,
  roundNo: number,
): Promise<AllBidTurnHistory> => {
  try {
    return redis.commands.getValueFromKey(
      `${PREFIX.TURN_HISTORY}:${PREFIX.BID}:${tableId}:${roundNo}`,
    );
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : getBidTurnHistory :: tableId: ${tableId} :: roundNo: ${roundNo} `,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
};
const setBidTurnHistory = (tableId: string, roundNo: number, value: any) => {
  try {
    const key = `${PREFIX.TURN_HISTORY}:${PREFIX.BID}:${tableId}:${roundNo}`;
    return redis.commands.setValueInKeyWithExpiry(key, value);
  } catch (e) {
    logger.error(
      tableId,
      'CATCH_ERROR in setBidTurnHistory: ',
      roundNo,
      tableId,
      value,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
};

const removeBidTurnHistory = (tableId: string, roundNo: number) =>
  redis.commands.deleteKey(
    `${PREFIX.TURN_HISTORY}:${PREFIX.BID}:${tableId}:${roundNo}`,
  );

// Round Score History Function
const getRoundScoreHistory = (tableId: string) => {
  try {
    return redis.commands.getValueFromKey(`${PREFIX.SCORE_HISTORY}:${tableId}`);
  } catch (e) {
    logger.error(tableId, 'CATCH_ERROR in getRoundScoreHistory: ', tableId, e);
    throw new Errors.CancelBattle(e);
  }
};

const setRoundScoreHistory = (tableId: string, value: any) => {
  try {
    const key = `${PREFIX.SCORE_HISTORY}:${tableId}`;
    return redis.commands.setValueInKeyWithExpiry(key, value);
  } catch (e) {
    logger.error(
      tableId,
      'CATCH_ERROR in setRoundScoreHistory: ',
      tableId,
      value,
      e,
    );
    throw new Errors.CancelBattle(e);
  }
};

const removeRoundScoreHistory = (tableId: string) =>
  redis.commands.deleteKey(`${PREFIX.SCORE_HISTORY}:${tableId}`);

// table push pop in queue
const pushTableInQueue = async (key: string, data: any) =>
  redis.commands.pushIntoQueue(key, data);

const popTableFromQueue = async (key: string) =>
  redis.commands.popFromQueue(key);

const remTableFromQueue = async (key: string, tableId: string) =>
  redis.commands.remFromQueue(key, tableId);

const getTableValueFromIndexFromQueue = async (key: string, index: number) =>
  redis.commands.getValueFromIndexFromQueue(key, index);

const getTableLengthfromQueue = async (key: string) =>
  redis.commands.getLengthfromQueue(key);

// Rejoin User Function
const getRejoinTableHistory = (
  userId: string,
  gameId: string,
  lobbyId: string,
): Promise<RejoinTableHistoryIf> =>
  redis.commands.getValueFromKey(
    `${PREFIX.REJOIN_HISTORY}:${userId}:${gameId}:${lobbyId}`,
  );

const setRejoinTableHistory = async (
  userId: number,
  gameId: string,
  lobbyId: string,
  value: RejoinTableHistoryIf,
) => {
  try {
    value = await Validator.methodValidator.rejoinTableHistoryValidator(value);
    const key = `${PREFIX.REJOIN_HISTORY}:${userId}:${gameId}:${lobbyId}`;
    return redis.commands.setValueInKeyWithExpiry(key, value);
  } catch (e) {
    logger.error(
      userId,
      `CATCH_ERROR : setRejoinTableHistory :: userId : ${userId} :: gameId : ${gameId} :: lobbyId : ${lobbyId}`,
      value,
      e,
    );
    throw e;
  }
};

const removeRejoinTableHistory = (
  userId: string,
  gameId: string,
  lobbyId: string,
) =>
  redis.commands.deleteKey(
    `${PREFIX.REJOIN_HISTORY}:${userId}:${gameId}:${lobbyId}`,
  );

// User Function
const setUser = async (userId: string, data: userIf) => {
  data = await Validator.methodValidator.userDetailValidator(data);
  await redis.commands.setValueInKey(`${PREFIX.USER}:${userId}`, data);
  return userId;
};

const getUser = async (userId: string) => {
  try {
    return redis.commands.getValueFromKey(`${PREFIX.USER}:${userId}`);
  } catch (e) {
    logger.error(userId, `CATCH_ERROR in getUser :: userId : ${userId}`, e);
    throw e;
  }
};

const removeUser = async (userId: string) => {
  try {
    return redis.commands.deleteKey(`${PREFIX.USER}:${userId}`);
  } catch (e) {
    logger.error(userId, `CATCH_ERROR in removeUser :: userId : ${userId}`, e);
    throw e;
  }
};

const setCounterIntialValue = async (onlinePlayer: string) => {
  try {
    const counter = NUMERICAL.ZERO;
    return redis.commands.setValueInKey(
      `${PREFIX.ONLINE_USER_COUNTER}:${onlinePlayer}`,
      counter,
    );
  } catch (error) {
    logger.error('CATCH_ERROR : setCounterIntialValue', error);
    throw error;
  }
};

const getOnliPlayerCount = async (onlinePlayer: string) => {
  try {
    const count = await redis.commands.getValueFromKey(
      `${PREFIX.ONLINE_USER_COUNTER}:${onlinePlayer}`,
    );
    return count;
  } catch (error) {
    logger.error('CATCH_ERROR :  getOnliPlayerCount', error);
  }
};

const incrCounter = async (onlinePlayer: string) => {
  try {
    return redis.commands.setIncrementCounter(
      `${PREFIX.ONLINE_USER_COUNTER}:${onlinePlayer}`,
    );
  } catch (error) {
    logger.error('CATCH_ERROR : incrCounter', error);
    throw error;
  }
};

const decrCounter = async (onlinePlayer: string) => {
  try {
    return redis.commands.setDecrementCounter(
      `${PREFIX.ONLINE_USER_COUNTER}:${onlinePlayer}`,
    );
  } catch (error) {
    logger.error('CATCH_ERROR : decrCounter', error);
    throw error;
  }
};

const setCounterIntialValueLobby = async (
  onlinePlayerLobby: string,
  lobbyId: string,
) => {
  try {
    const counter = NUMERICAL.ZERO;
    return redis.commands.setValueInKey(
      `${PREFIX.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`,
      counter,
    );
  } catch (error) {
    logger.error('CATCH_ERROR : setCounterIntialValue', error);
    throw error;
  }
};

const getOnliPlayerCountLobbyWise = async (
  onlinePlayerLobby: string,
  lobbyId: string,
) => {
  try {
    const count = await redis.commands.getValueFromKey(
      `${PREFIX.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`,
    );

    return count;
  } catch (error) {
    logger.error('CATCH_ERROR :  getOnliPlayerCount', error);
  }
};

const removeOnliPlayerCountLobbyWise = (
  onlinePlayerLobby: string,
  lobbyId: string,
) =>
  redis.commands.deleteKey(
    `${PREFIX.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`,
  );

const incrCounterLobbyWise = async (
  onlinePlayerLobby: string,
  lobbyId: string,
) => {
  try {
    return redis.commands.setIncrementCounter(
      `${PREFIX.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`,
    );
  } catch (error) {
    logger.error('CATCH_ERROR : incrCounterLobbyWise', error);
    throw error;
  }
};

const decrCounterLobbyWise = async (
  onlinePlayerLobby: string,
  lobbyId: string,
) => {
  try {
    return redis.commands.setDecrementCounter(
      `${PREFIX.ONLINE_USER_COUNTER}:${lobbyId}:${onlinePlayerLobby}`,
    );
  } catch (error) {
    logger.error('CATCH_ERROR : decrCounterLobbyWise', error);
    throw error;
  }
};

const exportObject = {
  setPlayerGamePlay,
  getPlayerGamePlay,
  setTableData,
  getTableData,
  setRoundTableData,
  updateRoundTableData,
  getRoundTableData,
  pushTableInQueue,
  popTableFromQueue,
  remTableFromQueue,
  getTurnHistory,
  setTurnHistory,
  getBidTurnHistory,
  setBidTurnHistory,
  getRoundScoreHistory,
  setRoundScoreHistory,
  removeTableData,
  removePlayerGameData,
  removeRoundTableData,
  removeBidTurnHistory,
  removeTurnHistory,
  removeRoundScoreHistory,
  getRejoinTableHistory,
  setRejoinTableHistory,
  removeRejoinTableHistory,
  setUser,
  getUser,
  removeUser,
  incrCounter,
  decrCounter,
  setCounterIntialValue,
  getOnliPlayerCount,
  setCounterIntialValueLobby,
  getOnliPlayerCountLobbyWise,
  removeOnliPlayerCountLobbyWise,
  incrCounterLobbyWise,
  decrCounterLobbyWise,
  getTableValueFromIndexFromQueue,
  getTableLengthfromQueue,
};

export = exportObject;
