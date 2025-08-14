import 'dotenv/config';

const processEnv = process.env;
let configData: any = null;

function getEnvJSON(env: any) {
  const NODE_ENV = `NODE_ENV`;
  const serverType = `SERVER_TYPE`;
  const serverPort = `SERVER_PORT`;
  const redisHost = `${env}_REDIS_HOST`;
  const redisPassword = `${env}_REDIS_PASSWORD`;
  const redisPort = `${env}_REDIS_PORT`;
  const schedulerRedisHost = `${env}_SCHEDULER_REDIS_HOST`;
  const schedulerRedisPassword = `${env}_SCHEDULER_REDIS_PASSWORD`;
  const schedulerRedisPort = `${env}_SCHEDULER_REDIS_PORT`;
  const pubSubRedisHost = `${env}_PUBSUB_REDIS_HOST`;
  const pubSubRedisPassword = `${env}_PUBSUB_REDIS_PASSWORD`;
  const pubSubRedisPort = `${env}_PUBSUB_REDIS_PORT`;
  const redisDB = `${env}_REDIS_DB`;
  const dbProto = `${env}_DB_PROTO`;
  const dbHost = `${env}_DB_HOST`;
  const dbPort = `${env}_DB_PORT`;
  const dbUsername = `${env}_DB_USERNAME`;
  const dbPassword = `${env}_DB_PASSWORD`;
  const dbName = `${env}_DB_NAME`;
  const MONGO_SRV = `MONGO_SRV`;
  const WINNING_SCORES = `${env}_WINNING_SCORES`;
  const HTTPS_KEY = `HTTPS_KEY`;
  const HTTPS_CERT = `HTTPS_CERT`;
  const APP_KEY = `APP_KEY`;
  const APP_DATA = `APP_DATA`;
  const SECRET_KEY = `SECRET_KEY`;
  const REDIS_CONNECTION_URL = `REDIS_CONNECTION_URL`;

  const API_BASE_URL = `API_BASE_URL`;
  const GAME_ID = `GAME_ID`;

  return Object.freeze({
    NODE_ENV: processEnv[NODE_ENV],
    SERVER_TYPE: processEnv[serverType],
    HTTP_SERVER_PORT: processEnv[serverPort],
    REDIS_HOST: processEnv[redisHost],
    REDIS_PASSWORD: processEnv[redisPassword],
    REDIS_PORT: processEnv[redisPort],
    REDIS_DB: processEnv[redisDB],

    HTTPS_KEY: processEnv[HTTPS_KEY],
    HTTPS_CERT: processEnv[HTTPS_CERT],

    REDIS_CONNECTION_URL: processEnv[REDIS_CONNECTION_URL],

    SCHEDULER_REDIS_HOST: processEnv[schedulerRedisHost],
    SCHEDULER_REDIS_PASSWORD: processEnv[schedulerRedisPassword],
    SCHEDULER_REDIS_PORT: processEnv[schedulerRedisPort],

    PUBSUB_REDIS_HOST: processEnv[pubSubRedisHost],
    PUBSUB_REDIS_PASSWORD: processEnv[pubSubRedisPassword],
    PUBSUB_REDIS_PORT: processEnv[pubSubRedisPort],

    DB_PROTO: processEnv[dbProto],
    DB_HOST: processEnv[dbHost],
    DB_PORT: processEnv[dbPort],
    DB_USERNAME: processEnv[dbUsername],
    DB_PASSWORD: processEnv[dbPassword],
    DB_NAME: processEnv[dbName],
    MONGO_SRV: processEnv[MONGO_SRV],

    //keys
    APP_KEY: processEnv[APP_KEY],
    APP_DATA: processEnv[APP_DATA],
    SECRET_KEY: processEnv[SECRET_KEY],

    //meassge
    USER_PROFILE_INACTIVE: `DISCONNECTED \nAUTOPLAY`,
    USER_PROFILE_INACTIVE_ON_LEFT: `LEFT \nAUTOPLAY`,
    TIME_OUT_POPUP_MESSAGE: `Because of your inactivity, random cards will be discarded until you are active again. Please come back to continue your game.`,
    REJOIN_POP_REASON: `You are exit from the game, please relaunch the app to connect.`,
    BACK_IN_GAME_MESSAGE: `I am back`,
    REJOIN_END_GAME_REASON: `The winner is declared in the previous game. Please exit and join again!`,
    BEFORE_GAME_START_LEAVE_REASON: `You have left the previous game before game start. Please exit and join again!`,
    LOCK_IN_PERIOD: `PLAYERS ON THIS TABLE HAVE BEEN LOCKED. NOTE: ENTRY FEE WILL BE DEDUCTED IF YOU LEAVE THE TABLE NOW.`,
    FTUE_DISCONNECT_POP_REASON: `You have been removed from this table because of your inactivity from a long time. Please exit and join again. Thank you!`,
    REJOIN_TIMER: 120000,
    TIME_OUT_COUNT: 2,

    // Client api
    GAME_ID: processEnv[GAME_ID],
    VERIFY_USER_PROFILE: `${processEnv[API_BASE_URL]}/gameServerApi/checkIsValidToken`,
    GET_USER_OWN_PROFILE: `${processEnv[API_BASE_URL]}/gameServerApi/getUsersOwnProfile`,
    DEDUCT_USER_ENTRY_FEE: `${processEnv[API_BASE_URL]}/gameServerApi/deductEntryFee`,
    MULTI_PLAYER_SUBMIT_SCORE: `${processEnv[API_BASE_URL]}/gameServerApi/multiPlayerSubmitScore`,
    GAME_SETTING_MENU_HELP: `${processEnv[API_BASE_URL]}/gameServerApi/getGameRules`,
    MARK_COMPLETED_GAME_STATUS: `${processEnv[API_BASE_URL]}/gameServerApi/markCompletedGameStatus`,
    GET_ONE_ROBOT: `${processEnv[API_BASE_URL]}/gameServerApi/getBot`,
    CHECK_BALANCE: `${processEnv[API_BASE_URL]}/gameServerApi/checkBalance`,
    REDIUS_CHECK: `${processEnv[API_BASE_URL]}/gameServerApi/getRadiusLocation`,
    FTUE_UPDATE: `${processEnv[API_BASE_URL]}/gameServerApi/userFirstTimeIntrection`,
    CHECK_USER_BLOCK_STATUS: `${processEnv[API_BASE_URL]}/gameServerApi/checkUserBlockStatus`,
    CHECK_MAINTANENCE: `${processEnv[API_BASE_URL]}/gameServerApi/checkMaintanence`,
    MULTI_PLAYER_DEDUCT_ENTRY_FEE: `${processEnv[API_BASE_URL]}/gameServerApi/multiPlayerDeductEntryFee`,
    ADD_GAME_RUNNING_STATUS: `${processEnv[API_BASE_URL]}/gameServerApi/addRunningGameStatus`,
    GET_MATCH_DATA: `${processEnv[API_BASE_URL]}/gameServerApi/getMatchData`,

    // remening to add on zk
    WINNING_SCORES: processEnv[WINNING_SCORES],
    FTUE: true,
    HAND_POINT: 1,
    EXTRA_HAND_POINT: 0.1,
    BONUS_POINT: 13,
    EXTRA_HAND_LOGIC: false,
    BONUS_LOGIC: false,
    GAME_START_TIMER: 10,
    GAME_TURN_TIMER: 15,
    ROUND_START_TIMER: 10,
    NEW_GAME_START_TIMER: 10,
    MIN_BID: 1,
    MAX_BID: 13,
    MORE_THEN_DISTANCE_TO_JOIN: 50,
    ROBOT_WAITING_TIMER: 5,
  });
}

export const getConfig = () => {
  const {NODE_ENV} = process.env;
  configData = getEnvJSON(NODE_ENV);
  return configData;
};

export default {getConfig};
