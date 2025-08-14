import logger from "../logger";
import CommonEventEmitter from "../commonEventEmitter";
import { EVENTS, EVENT_EMITTER, PLAYER_STATE } from "../../constants";
import {
  sendEventToClient,
  sendEventToRoom,
  addClientInRoom,
  leaveClientInRoom,
} from "../socket";
import { initializeGameplayForFirstRound } from "../signUp/initialiseGame";
import startRound from "../play/startRound";
import { cancelRejoinPlayingTimer } from "../play/rejoinTable/rejoinTablePopUp";
import { helpers, leaveTable } from "../play";
import { bidTurnForBot, /*signUpForBot*/ } from "../FTUE";
import { botGameConfigIf } from "../interface/botIf";
import { playerPlayingDataIf } from "../interface/playerPlayingTableIf";
import { playingTableIf } from "../interface/playingTableIf";
import botBidTurn from "../playBot/bidTurn";
import botCardThrow from "../playBot/cardThrow";
import findBot from "../playBot/findBot";

function heartBeatEvent(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.HEART_BEAT_SOCKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}

function doneEvent(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.DONE_SOCKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}

function singUpCompleteEvent(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.SIGN_UP_SOCKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}

function gameTableInfoEvent(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.GAME_TABLE_INFO_SOCKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}

function addPlayInTableRoomEvent(payload: any) {
  const { socket, data } = payload;
  addClientInRoom(socket, data.tableId);
}

function joinTableEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.JOIN_TABLE_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}

function roundTimerStartedEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.ROUND_TIMER_STARTED_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}

function collectBootValueEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}

function showMyCardsEvent(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.SHOW_MY_CARDS_SOCKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}
function sendUserTurnEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.USER_TURN_STARTED_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}

function sendUserBidTurnEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.USER_BID_TURN_STARTED_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
async function cancelBidTimer(data: any) {
  try {
    logger.debug(data, " cancelBidTimer round data ::: ");
  } catch (error) {
    logger.error(`cancelBidTimer::>Error :`, error);
  }
}
async function cancelPlayTurnTimer(data: any) {
  try {
    logger.debug(data, " cancelPlayTurnTimer round data :: ");
  } catch (error) {
    logger.error(`cancelPlayTurnTimer::>Error :`, error);
  }
}

function sendUserShowBidInfoEvent(payload: any) {
  logger.debug("Send sendUserShowBidInfoEvent");
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.USER_BID_SHOW_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}

function sendCardThrowEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.USER_THROW_CARD_SHOW_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}

function sendWinOfRoundEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.WIN_OF_ROUND_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
function winnerDeclareEvent(payload: any) {
  const { tableId, socket, data } = payload;
  logger.debug("winnerDeclareEvent :: ", JSON.stringify(data));
  const responseData = {
    en: EVENTS.WINNER_DECLARE_SOCKET_EVENT,
    data,
  };
  if ((typeof tableId != "undefined" && typeof tableId) === "string") {
    sendEventToRoom(tableId, responseData);
  } else {
    sendEventToClient(socket, responseData);
  }
}

function scoreBoardEvent(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.SHOW_SCORE_BOARD,
    data,
  };
  sendEventToClient(socket, responseData);
}

function leaveTableEvent(payload: any) {
  const { socket, tableId, flag, data } = payload;
  if (flag === PLAYER_STATE.DISCONNECT || flag === PLAYER_STATE.LEFT) {
    leaveClientInRoom(socket, tableId);
  }
  const responseData = {
    en: EVENTS.LEAVE_TABLE_SCOKET_EVENT,
    data,
  };
  // sendEventToClient(socket, responseData); // LT event only send in room
  sendEventToRoom(tableId, responseData);
}
function timeOutToleaveTable(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.TIME_OUT_LEAVE_TABLE_POPUP_SCOKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}
function rejoinTableData(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.REJOIN_SOCKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}
function lockTableEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.LOCK_IN_PERIOD_POPUP_SCOKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}
function backInGamePlayingEvent(payload: any) {
  const { tableId, data } = payload;
  const responseData = {
    en: EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT,
    data,
  };
  sendEventToRoom(tableId, responseData);
}

function insufficientFunds(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.INSUFFICIENT_FUND_SOCKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}
function showPopUpErrorMessages(payload: any) {
  const { socket, tableId, data } = payload;
  const responseData = {
    en: EVENTS.SHOW_POPUP_ERROR_MESSAGES_SOCKET_EVENT,
    data,
  };
  if (typeof socket !== undefined) sendEventToClient(socket, responseData);
  else sendEventToRoom(tableId, responseData);
}

function showPopUpMessages(payload: any) {
  const { socket, tableId, data } = payload;
  const responseData = {
    en: EVENTS.SHOW_POPUP,
    data,
  };
  if (socket) {
    sendEventToClient(socket, responseData);
  }
  else {
    sendEventToRoom(tableId, responseData);
  }
}

function rejoinPopUpEvent(payload: any) {
  const { socket, tableId, data } = payload;
  const responseData = {
    en: EVENTS.REJOIN_POPUP_SOCKET_EVENT,
    data,
  };
  sendEventToClient(socket, responseData);
}



function showPopUpMethodMessages(payload: any) {
  const { socket, data } = payload;
  const responseData = {
    en: EVENTS.SHOW_POPUP_WITH_METHOD,
    data,
  };
  sendEventToClient(socket, responseData);
}

CommonEventEmitter.on(
  EVENTS.SHOW_POPUP_ERROR_MESSAGES_SOCKET_EVENT,
  showPopUpErrorMessages
);

CommonEventEmitter.on(EVENTS.SHOW_POPUP, showPopUpMessages);

CommonEventEmitter.on(EVENTS.SHOW_POPUP_WITH_METHOD, showPopUpMethodMessages);

CommonEventEmitter.on(EVENTS.HEART_BEAT_SOCKET_EVENT, heartBeatEvent);

CommonEventEmitter.on(EVENTS.DONE_SOCKET_EVENT, doneEvent);

CommonEventEmitter.on(EVENTS.SIGN_UP_SOCKET_EVENT, singUpCompleteEvent);

CommonEventEmitter.on(EVENTS.GAME_TABLE_INFO_SOCKET_EVENT, gameTableInfoEvent);

CommonEventEmitter.on(EVENTS.JOIN_TABLE_SOCKET_EVENT, joinTableEvent);

CommonEventEmitter.on(
  EVENTS.ROUND_TIMER_STARTED_SOCKET_EVENT,
  roundTimerStartedEvent
);

CommonEventEmitter.on(EVENT_EMITTER.ROUND_STARTED, startRound);
CommonEventEmitter.on(EVENTS.ADD_PLAYER_IN_TABLE_ROOM, addPlayInTableRoomEvent);

CommonEventEmitter.on(
  EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT,
  collectBootValueEvent
);

CommonEventEmitter.on(
  EVENT_EMITTER.INITIALIZE_GAME_PLAY,
  initializeGameplayForFirstRound
);

CommonEventEmitter.on(EVENTS.SHOW_MY_CARDS_SOCKET_EVENT, showMyCardsEvent);
CommonEventEmitter.on(EVENTS.USER_TURN_STARTED_SOCKET_EVENT, sendUserTurnEvent);
CommonEventEmitter.on(
  EVENTS.USER_BID_TURN_STARTED_SOCKET_EVENT,
  sendUserBidTurnEvent
);
CommonEventEmitter.on(
  EVENT_EMITTER.PLAYER_BID_TURN_TIMER_CANCELLED,
  cancelBidTimer
);
CommonEventEmitter.on(
  EVENT_EMITTER.PLAYER_TURN_TIMER_CANCELLED,
  cancelPlayTurnTimer
);
CommonEventEmitter.on(
  EVENT_EMITTER.PLAYER_BID_TURN_TIMER_EXPIRED,
  (res: any) => {
    helpers.setBidOnTurnExpire(res.tableData);
  }
);

CommonEventEmitter.on(EVENT_EMITTER.BOT_BID_TURN_TIMER_FOR_FTUE, (res: any) => {
  bidTurnForBot(res.playerGamePlay, res.tableData);
});
CommonEventEmitter.on(
  EVENTS.USER_BID_SHOW_SOCKET_EVENT,
  sendUserShowBidInfoEvent
);
CommonEventEmitter.on(
  EVENTS.USER_THROW_CARD_SHOW_SOCKET_EVENT,
  sendCardThrowEvent
);

CommonEventEmitter.on(EVENT_EMITTER.PLAYER_TURN_TIMER_EXPIRED, (res: any) => {
  helpers.cardThrowTurnExpire(res.playerGamePlay, res.tableData, res.isAutoMode);
});

CommonEventEmitter.on(
  EVENT_EMITTER.INITIAL_TURN_SETUP_TIMER_EXPIRED,
  (res: any) => {
    let startUserTurn = helpers.startUserTurn(res.tableData, res.playerGamePlayData, res.nextTurn);
  }
);
CommonEventEmitter.on(EVENT_EMITTER.TIME_OUT_TO_LEAVE_TABLE, (res: any) => {
  leaveTable(res.tableId, res.flag, res.userScoket);
});

CommonEventEmitter.on(EVENT_EMITTER.WIN_OF_ROUND_TIMER, (res: any) =>
  helpers.winOfRound(res.tableId)
);
CommonEventEmitter.on(EVENTS.WIN_OF_ROUND_SOCKET_EVENT, sendWinOfRoundEvent);
CommonEventEmitter.on(EVENTS.WINNER_DECLARE_SOCKET_EVENT, winnerDeclareEvent);
CommonEventEmitter.on(EVENTS.SHOW_SCORE_BOARD, scoreBoardEvent);
CommonEventEmitter.on(EVENTS.LEAVE_TABLE_SCOKET_EVENT, leaveTableEvent);
CommonEventEmitter.on(
  EVENTS.TIME_OUT_LEAVE_TABLE_POPUP_SCOKET_EVENT,
  timeOutToleaveTable
);
CommonEventEmitter.on(EVENTS.REJOIN_SOCKET_EVENT, rejoinTableData);
CommonEventEmitter.on(
  EVENT_EMITTER.REJOIN_TIMER_CANCELLED,
  async (res: any) => {
    cancelRejoinPlayingTimer(res.tableId, res.userId, res.gameId, res.lobbyId);
  }
);
CommonEventEmitter.on(EVENTS.LOCK_IN_PERIOD_POPUP_SCOKET_EVENT, lockTableEvent);
CommonEventEmitter.on(
  EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT,
  backInGamePlayingEvent
);

CommonEventEmitter.on(EVENTS.INSUFFICIENT_FUND_SOCKET_EVENT, insufficientFunds);

CommonEventEmitter.on(EVENTS.RESUFFLE_CARDS, (res: any) => {
  logger.info('res ::>> ', res);
  startRound(res.data, res.counter, res.nextTurn, res.dealerIndex, res.dealerId);
});


CommonEventEmitter.on(EVENTS.REJOIN_POPUP_SOCKET_EVENT, rejoinPopUpEvent);

// for bot
CommonEventEmitter.on(
  EVENT_EMITTER.FIND_BOT,
  (res: { tableId: string; gameConfig: botGameConfigIf }) => {
    logger.info('find bot res ::: ', res);
    findBot(res.tableId, res.gameConfig);
  },
);
CommonEventEmitter.on(
  EVENT_EMITTER.TACK_BOT_BID_TURN,
  (res: { playerGamePlay: playerPlayingDataIf; tableData: playingTableIf }) => {
    logger.info('Bid Turn bot res ::: ', res);
    botBidTurn(res.playerGamePlay, res.tableData);
  },
);
CommonEventEmitter.on(
  EVENT_EMITTER.TACK_BOT_TURN,
  (res: { playerGamePlay: playerPlayingDataIf; tableData: playingTableIf }) => {
    logger.info('Card Turn bot res ::: ', res);
    botCardThrow(res.playerGamePlay, res.tableData);
  },
);


