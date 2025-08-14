import logger from '../logger';
import {EVENTS} from '../../constants';
import {
  userBidHandler,
  signUpHandler,
  sendHeartBeat,
  throwCardHandler,
  showScoreBoardHandler,
  leaveTableHandler,
  newGameStartHandler,
  backInGamePlayingHandler,
  userRejoinHelper,
  ftueMessage,
  ftueChangeStep,
  showGameTableInfoHelper,
  showSettingMenuHelpInfoHelper,
  rejoinOrNewGameHandler,
} from './requestHelper';
import userDisconnect from '../signUp/userDisconnect';

async function requestHandler(
  this: any,
  [reqEventName, payload, ack]: Array<any>,
  // @ts-expect-error - next parameter is not used but required by middleware signature
  next,
): Promise<boolean> {
  const body = typeof payload == 'string' ? JSON.parse(payload) : payload;
  //const body = JSON.parse(payload); // for developement

  if (reqEventName != EVENTS.HEART_BEAT_SOCKET_EVENT) {
    logger.debug('requestHandler : body ::', reqEventName, body);
  }
  // this.metrics = body.metrics;

  if (!this) {
    logger.error(new Error('socket instance not found'));
  }

  /* +-------------------------------------------------------------------+
        desc: function to handle all event processes
        i/p: request = {en: `event name`, data: `data`}
    +-------------------------------------------------------------------+ */

  const data = body;
  try {
    if (typeof body.data == 'undefined' && typeof body.en == 'undefined') {
      throw new Error('Data not valid!');
    }

    if (!this) {
      throw new Error('socket instance not found');
    }
    if (reqEventName != EVENTS.HEART_BEAT_SOCKET_EVENT)
      logger.info('event ::', reqEventName, data);
    switch (reqEventName) {
      case EVENTS.HEART_BEAT_SOCKET_EVENT:
        sendHeartBeat(data, this, ack);
        break;
      case EVENTS.SIGN_UP_SOCKET_EVENT: {
        // User signUp
        const isRejoinOrNewGame = true;
        signUpHandler(data, isRejoinOrNewGame, this, ack);
        break;
      }
      case EVENTS.USER_BID_SOCKET_EVENT: // bid turn
        userBidHandler(data, this, ack);
        break;
      case EVENTS.USER_THROW_CARD_SOCKET_EVENT: // throw card turn
        throwCardHandler(data, this, ack);
        break;
      case EVENTS.SHOW_SCORE_BOARD: // show my score Board
        showScoreBoardHandler(data, this, ack);
        break;
      case EVENTS.LEAVE_TABLE_SCOKET_EVENT: // user Leave
        leaveTableHandler(data, this, ack);
        break;
      case EVENTS.NEW_GAME_START: // start new game after finish One Game
        newGameStartHandler(data, this, ack);
        break;
      case EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT: // user back In the game Playing
        backInGamePlayingHandler(data, this, ack);
        break;
      case EVENTS.REJOIN_SOCKET_EVENT: // user Rejoin In the game Playing
        userRejoinHelper(data, this, ack);
        break;
      case EVENTS.FTUE_MESSAGE_SOCKET_EVENT: // static FTUE Message FTUE_MESSAGE
        ftueMessage(data, this, ack);
        break;
      case EVENTS.FTUE_CHANGE_STEP_SOCKET_EVENT: // change FTUE Step
        ftueChangeStep(data, this, ack);
        break;
      case EVENTS.GTI_INFO_SOCKET_EVENT: // Game setting menu info
        showGameTableInfoHelper(data, this, ack);
        break;
      case EVENTS.GAME_SETTING_MENU_HELP_SOCKET_EVENT: // Game setting menu help
        showSettingMenuHelpInfoHelper(data, this, ack);
        break;
      case EVENTS.DISCONNECT: //
        logger.info('user disconnect :: ', JSON.stringify(data));
        userDisconnect(this);
        break;
      case EVENTS.REJOIN_OR_NEW_GAME_SOCKET_EVENT: //REJOIN_OR_NEW_GAME
        rejoinOrNewGameHandler(data.data, this, ack);
        break;

      default:
        break;
    }
  } catch (error) {
    logger.error(
      'CATCH_ERROR in eventHandler for event: ',
      reqEventName,
      error,
    );
  }
  return false;
}

export = requestHandler;
