import logger from '../../logger';
import {
  getTableData,
  getPlayerGamePlay,
  removeRejoinTableHistory,
  getRejoinTableHistory,
} from '../../gameTable/utils';
import rejoinPlayingTable from './index';
import { rejoinPlayingTablePopUp } from './rejoinTablePopUp';
import { userIf } from '../../interface/userSignUpIf';
import { playingTableIf } from '../../interface/playingTableIf';
import { playerPlayingDataIf } from '../../interface/playerPlayingTableIf';
import { EVENTS, MESSAGES, NUMERICAL } from '../../../constants';
import CommonEventEmitter from "../../commonEventEmitter";

// check Player Avalible in Playing for Re-join
const rejoinTable = async (
  userData: userIf,
  roomFlag: boolean,
  socket: any,
  ack?: Function,
) => {
  const { gameId, lobbyId, fromBack, userId, isFTUE, isAnyRunningGame } = userData;
  const { getLock } = global;
  const {
    getConfigData: {
      REJOIN_END_GAME_REASON,
    },
  } = global;
  // const rejoinTableLock = await getLock.acquire([userId], 2000);
  try {
    logger.debug(userId, 'rejoinTable :: fromBack ::', fromBack, "isAnyRunningGame :: ",isAnyRunningGame);

    if (fromBack) {
      // check Player Back in game from Back_Ground
      let rejoin = await rejoinPlayingTablePopUp(
        userId,
        gameId,
        lobbyId,
        roomFlag,
        isFTUE,
        socket,
        ack,
      );
      return rejoin;
    } else {
      logger.info(userId,'rejoinTable : call else rejoinTable fromBack is false');

      const rejoinPlayerData = await getRejoinTableHistory(
        userId,
        gameId,
        lobbyId,
      );
      logger.info(userId,'rejoinTable : rejoinPlayerData ::', rejoinPlayerData);
      if (!rejoinPlayerData) {
        // if(isAnyRunningGame) {
        //   const sendEventData = {
        //     statusFlag: true,
        //     message: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_MESSAGE,
        //     reason: REJOIN_END_GAME_REASON,
        //     type: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TYPE,
        //     title: MESSAGES.ALERT_MESSAGE.REJOIN_POPUP_TITLE,
        //     buttonCount: NUMERICAL.TWO,
        //     button_text: [
        //       MESSAGES.ALERT_MESSAGE.BUTTON_TEXT
        //         .EXIT /* MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NO*/,
        //       MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NEW_GAME 
        //     ],
        //     button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED, MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.GREEN],
        //     button_methods: [
        //       MESSAGES.ALERT_MESSAGE.BUTTON_METHOD
        //         .EXIT /* MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.NO*/,
        //       MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.YES 
        //     ],
        //     showLoader: false,
        //   };
        //   throw sendEventData;
        // }else{
          return true;
        // }
      } else {
        const { tableId, isEndGame } = rejoinPlayerData;
        if (!isEndGame) {
          const playingTableData: playingTableIf = await getTableData(tableId);
          if (!playingTableData) {
            await removeRejoinTableHistory(userId, gameId, lobbyId);
            return true;
          } else {
            const userPlayingTable: playerPlayingDataIf =
              await getPlayerGamePlay(userId, tableId);
            logger.info(userId,'rejoinTable : userPlayingTable ::', userPlayingTable);

            if (!userPlayingTable) {
              await removeRejoinTableHistory(userId, gameId, lobbyId);
              return true;
            } else {
              if (userPlayingTable.isLeft) {
                await removeRejoinTableHistory(userId, gameId, lobbyId);
                return true;
              } else {
                logger.info(userId,
                  'rejoinTable ::: rejoinTableOnKillApp ::: rejoin success fulliy ::: 11 :::',
                );
                rejoinPlayingTable(
                  userId,
                  tableId,
                  roomFlag,
                  socket,
                  true,
                  ack,
                );
                return false;
              }
            }
          }
        } else {
          logger.info(userId,"rejoinPlayingTablePopUp : send End Game Message.", rejoinPlayerData);
          await removeRejoinTableHistory(userId, gameId, lobbyId);
          
          if(isAnyRunningGame) {
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
                MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.NEW_GAME 
              ],
              button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED, MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.GREEN],
              button_methods: [
                MESSAGES.ALERT_MESSAGE.BUTTON_METHOD
                  .EXIT /* MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.NO*/,
                MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.YES 
              ],
              showLoader: false,
            };
            throw sendEventData;
          }else{
            return true;
          }

        }
      }
    }
  } catch (error: any) {
    logger.error(userId, 
      `CATCH_ERROR : rejoinTableOnKillApp ::: userId: ${userId} :: gameId: ${gameId} :: lobbyId: ${lobbyId} :: `,
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
    return false;

  } finally {
    // await getLock.release(rejoinTableLock);
  }
};

export = rejoinTable;
