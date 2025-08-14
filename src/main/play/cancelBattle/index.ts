import logger from '../../logger';
import {EVENTS, MESSAGES, NUMERICAL, PLAYER_STATE} from '../../../constants';
import {
  getPlayerGamePlay,
  getRoundTableData,
  getTableData,
} from '../../gameTable/utils';
import CommonEventEmitter from '../../commonEventEmitter';
import {playingTableIf} from '../../interface/playingTableIf';
import leaveTable from '../leaveTable';
import _ from 'underscore';

async function cancelBattleAckToClient(
  errMsg: string,
  tableData: playingTableIf,
  userProfiles: any, //userIf[],
) {
  for (let i = 0; i < userProfiles.length; i++) {
    const userProfile = userProfiles[i];

    if (userProfile && userProfile.socketId && userProfile.userId) {
      const socketObj = {
        id: userProfile.socketId,
        eventMetaData: {
          userObjectId: userProfile._id,
          tableId: tableData._id,
          userId: userProfile.userId,
        },
      };
      await leaveTable(
        tableData._id,
        PLAYER_STATE.LEFT,
        socketObj,
        undefined,
        false,
      );
      // leaveTable(tableData._id, PLAYER_STATE.LEFT, socketObj, undefined);

      // Player miss number of turn then defind in Auto Turn
      // await Scheduler.addJob.leaveTableTimer({
      //   timer: NUMERICAL.ZERO * NUMERICAL.THOUSAND,
      //   jobId: `${userProfile.userId}:${tableData.currentRound}`,
      //   tableId: tableData._id,
      //   flag: FROM_CANCEL_BATTLE,
      //   socketObj,
      // });

      const nonProdMsg = errMsg;
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket: userProfile.socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.ENTRY_FEE_DEDUCTED_MSG,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    }
  }
}

async function cancelBattle(cancelBattleInput: any) {
  const {tableId, errorMessage} = cancelBattleInput;
  try {
    const {getConfigData} = global;

    const tableConfig = await getTableData(tableId);
    logger.info(
      tableId,
      tableConfig,
      '  tableConfig data for table to cancelBattle :-',
      tableId,
    );
    console.log(
      '===============================================================',
    );
    console.log(
      '======================= cancelBattle =========================',
    );
    console.log(
      '===============================================================',
    );

    const {currentRound, lobbyId} = tableConfig;

    const roundTableData = await getRoundTableData(tableId, currentRound);
    logger.debug(
      tableId,
      roundTableData,
      '  roundTableData data for table to cancelBattle:-',
      tableId,
    );

    const playingUsers = roundTableData.seats;

    const userIds: string[] = _.compact(_.pluck(playingUsers, 'userId'));
    logger.info(tableId, 'userIds :==>> ', userIds);

    const userProfiles = await Promise.all(
      userIds.map((userId: string) => {
        return getPlayerGamePlay(userId, tableId);
      }),
    );

    logger.debug(tableId, userProfiles, '  userProfiles for table : ', tableId);

    // send event to client
    await cancelBattleAckToClient(
      getConfigData.GSSP ? getConfigData.GSSP : 'cancel Battle',
      tableConfig,
      userProfiles,
    );

    return true;
  } catch (error) {
    logger.error(
      tableId,
      `CATCH_ERROR : Found error at cancelBattle : table - ${
        cancelBattleInput && cancelBattleInput.tableId
          ? cancelBattleInput.tableId
          : ''
      }`,
      error,
    );
    return false;
  }
}

export = cancelBattle;
