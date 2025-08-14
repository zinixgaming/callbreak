import _ from 'underscore';
import logger from '../../logger';
import {
  getRoundTableData,
  setRoundTableData,
  setRejoinTableHistory,
  getUser,
  popTableFromQueue,
} from '../../gameTable/utils';
import {
  EVENTS,
  TABLE_STATE,
  NUMERICAL,
  MESSAGES,
  GAME_TYPE,
} from '../../../constants';
import Scheduler from '../../scheduler';
import {formatCollectBootValue} from '../../play/helpers/playHelper';
import CommonEventEmitter from '../../commonEventEmitter';
import cancelBattle from '../../play/cancelBattle';
import Errors from '../../errors';
import {initializeGameplayIf} from '../../interface/schedulerIf';
import {removeAllPlayingTableAndHistory} from '../../play/leaveTable/helpers';
import {wallateDebit} from '../../clientsideapi';
import formatUpdatedUserBalance from '../helper/formatUpdatedUserBalance';
import {addLobbyTracking} from '../../PlayingTracking/helper';
import {upadedBalanceIf} from '../../interface/responseIf';
import {userIf} from '../../interface/userSignUpIf';
import entryFeeDeductManage from '../helper/entryFeeDeductManage';

async function initializeGameplayForFirstRound(data: initializeGameplayIf) {
  const {getLock, getConfigData: config} = global;
  const {tableId, roundTableData, tableData} = data;
  logger.debug(tableId, 'initializeGameplayForFirstRound .');
  logger.info(tableId, tableId, data);
  const {lobbyId, gameId} = tableData;
  const initializeGameplayForFirstRoundLock = await getLock.acquire(
    [tableId],
    2000,
  );
  try {
    const roundTableDataTemp = await getRoundTableData(
      tableId,
      roundTableData.currentRound,
    );

    logger.info(
      tableId,
      'initializeGameplayForFirstRound : roundTableDataTemp :: ',
      roundTableDataTemp,
    );
    const currentPlayersInTable = Object.keys(roundTableDataTemp.seats).filter(
      ele => roundTableDataTemp.seats[ele].userId,
    ).length;

    logger.info(
      tableId,
      'initializeGameplayForFirstRound : total Player in table --- ',
      currentPlayersInTable,
    );

    if (currentPlayersInTable === Number(roundTableData.noOfPlayer)) {
      const playingUsers = roundTableData.seats;

      roundTableData.tableState = TABLE_STATE.LOCK_IN_PERIOD;
      roundTableData.updatedAt = new Date();
      // roundTableData.tableCurrentTimer = Number(new Date());
      roundTableData.tableCurrentTimer = roundTableDataTemp.tableCurrentTimer;

      // roundTableData.tableCurrentTimer = new Date(
      //   Number(new Date()) + NUMERICAL.FOUR * NUMERICAL.THOUSAND,
      // );

      setRoundTableData(tableId, roundTableData.currentRound, roundTableData);

      if (!tableData.isFTUE) {
        // display popUp to user are you lock in table
        CommonEventEmitter.emit(EVENTS.LOCK_IN_PERIOD_POPUP_SCOKET_EVENT, {
          tableId: tableData._id,
          data: {
            msg: config.LOCK_IN_PERIOD,
          },
        });

        Object.keys(roundTableDataTemp.seats).filter(
          async (ele: string) =>
            await setRejoinTableHistory(
              roundTableDataTemp.seats[ele].userId,
              gameId,
              lobbyId,
              {
                userId: roundTableDataTemp.seats[ele].userId,
                tableId,
                isEndGame: false,
              },
            ),
        );
      }
      /**
       * scheduling 4 sec timer // locking period
       */
      logger.debug(
        tableId,
        'initializeGameplayForFirstRound : scheduled round timer :: ',
        {
          timer: (NUMERICAL.FOUR + NUMERICAL.ONE) * NUMERICAL.THOUSAND, // in milliseconds
          jobId: tableId,
          tableId,
          roundTableData,
          tableData,
        },
      );
      if (!tableData.isFTUE) {
        const userIds: string[] = _.compact(_.pluck(playingUsers, 'userId'));
        logger.info(tableId, 'userIds :==>> ', userIds);

        //New low for Debit all users entry fees
        const isEntryFeeDeductManage = await entryFeeDeductManage(
          tableId,
          roundTableData.currentRound,
          userIds,
        );
        logger.info(
          tableId,
          'isEntryFeeDeductManage :>> ',
          isEntryFeeDeductManage,
        );

        if (isEntryFeeDeductManage) {
          // // Add tracked lobby in mongoDB
          // await addLobbyTracking(userIds[0], tableId);

          await Scheduler.addJob.roundStartTimer({
            timer: (NUMERICAL.FOUR + NUMERICAL.ONE) * NUMERICAL.THOUSAND, // in milliseconds
            jobId: tableId,
            tableId,
            roundTableData,
            tableData,
          });
        }

        //OLD flow for Debit all users entry fees
        // for (let i = 0; i < userIds.length; i++) {
        //   const element = userIds[i];
        //   const apiData = {
        //     tableId,
        //     tournamentId: lobbyId
        //   }
        //   const getUserDetail : userIf = await getUser(element);
        //   logger.info(tableId,'getUserDetail  ==>>>', getUserDetail);

        //   const debitAmountDetail = await wallateDebit(apiData, getUserDetail.authToken, getUserDetail.socketId);
        //   logger.info("debitAmountDetail  :: >>", debitAmountDetail);

        // }
      } else {
        await Scheduler.addJob.roundStartTimer({
          timer: NUMERICAL.ONE * NUMERICAL.THOUSAND, // in milliseconds
          jobId: tableId,
          tableId,
          roundTableData,
          tableData,
        });
      }
    } else {
      logger.error(
        tableId,
        "initializeGameplayForFirstRound : initializeGame table can't start : wait for user",
      );
    }
  } catch (error) {
    logger.error(
      tableId,
      `CATCH_ERROR : initializeGameplayForFirstRound :: tableId: ${tableId} :: lobbyId: ${lobbyId} :: gameId: ${gameId} :: roundId: ${roundTableData._id} :: `,
      error,
    );
    if (error instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: error,
      });
    } else if (error instanceof Errors.createCardGameTableError) {
      // totalPlayers.forEach((element: any) => {
      //   UserProfile.deleteDisconnect(element._id);
      const nonProdMsg = 'Insufficient Balance!';
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        tableId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.INSUFFICIENT_BALANCE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
      await removeAllPlayingTableAndHistory(
        tableData,
        roundTableData,
        roundTableData.currentRound,
      );
      // removeRedisData(
      //   tableId,
      //   {
      //     playMore: false,
      //   },
      //   FROM_PLAY_AGAIN_POPUP,
      //   element._id,
      // );
      // });
    }
  } finally {
    await getLock.release(initializeGameplayForFirstRoundLock);
  }
}

const exportObject = {
  initializeGameplayForFirstRound,
};
export = exportObject;
