import {
  EVENTS,
  MESSAGES,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
} from '../../../constants';
import logger from '../../logger';
import {getRoundTableData, getTableData, getUser} from '../../gameTable/utils';
import {roundTableIf} from '../../interface/roundTableIf';
import {multiPlayerDeductEntryFeeResponse} from '../../interface/cmgApiIf';
import {multiPlayerDeductEntryFee} from '../../clientsideapi';
import {userIf} from '../../interface/userSignUpIf';
import formatUpdatedUserBalance from './formatUpdatedUserBalance';
import {formatCollectBootValue} from '../../play/helpers/playHelper';
import CommonEventEmitter from '../../commonEventEmitter';
import leaveTable from '../../play/leaveTable';
import Errors from '../../errors';

async function entryFeeDeductManage(
  tableId: string,
  currentRound: number,
  userIds: string[],
) {
  try {
    logger.info(
      tableId,
      `Starting entryFeeDeductManage for tableId : ${tableId}`,
    );
    const tableData = await getTableData(tableId);
    const roundTableData = await getRoundTableData(tableId, currentRound);

    logger.info('entryFeeDeductManage :: tableData  :: >>>', tableData);
    logger.info(
      'entryFeeDeductManage :: roundTableData  :: >>>',
      roundTableData,
    );

    const apiData = {
      tableId,
      tournamentId: tableData.lobbyId,
      userIds: userIds,
    };

    const userProfile = (await getUser(userIds[NUMERICAL.ZERO])) as userIf;
    const multiPlayerDeductEntryFeeData: multiPlayerDeductEntryFeeResponse =
      await multiPlayerDeductEntryFee(
        apiData,
        userProfile.authToken,
        userProfile.socketId,
      );
    logger.info(
      'entryFeeDeductManage ::  multiPlayerDeductEntryFeeData :: >> ',
      multiPlayerDeductEntryFeeData,
    );

    const {isMinPlayerEntryFeeDeducted, deductedUserIds, notDeductedUserIds} =
      multiPlayerDeductEntryFeeData;
    // let { isMinPlayerEntryFeeDeducted, deductedUserIds, notDeductedUserIds } = multiPlayerDeductEntryFeeData;
    // isMinPlayerEntryFeeDeducted = false;
    // deductedUserIds = ["64744f9762378445d00c88b2"];
    // notDeductedUserIds = ["64744fcf62378445d00c892a"];

    logger.info(
      ' entryFeeDeductManage :: isMinPlayerEntryFeeDeducted :: >> ',
      isMinPlayerEntryFeeDeducted,
    );
    logger.info(
      ' entryFeeDeductManage :: deductedUserIds :: >> ',
      deductedUserIds,
    );
    logger.info(
      ' entryFeeDeductManage ::  notDeductedUserIds :: >> ',
      notDeductedUserIds,
    );
    logger.info(
      ' entryFeeDeductManage ::  roundTableData.noOfPlayer :: >> ',
      roundTableData.noOfPlayer,
    );

    if (
      isMinPlayerEntryFeeDeducted &&
      deductedUserIds.length === Number(roundTableData.noOfPlayer)
    ) {
      //for send all user updated balance
      const balance = await formatUpdatedUserBalance(userIds);
      if (!balance) {
        throw new Error(`formatUpdatedUserBalance() FAILED`);
      }
      logger.info(
        tableId,
        'initializeGameplayForFirstRound :after collecting boot : users Balance',
        balance,
      );

      const eventData = await formatCollectBootValue(
        {userIds},
        tableData.bootValue,
        balance,
      );
      CommonEventEmitter.emit(EVENTS.COLLECT_BOOT_VALUE_SOCKET_EVENT, {
        tableId: tableData._id,
        data: eventData,
      });
    }

    if (notDeductedUserIds.length > NUMERICAL.ZERO) {
      //popup send and leave table
      for (let i = 0; i < notDeductedUserIds.length; i++) {
        const userProfile = (await await getUser(
          notDeductedUserIds[i],
        )) as userIf;
        if (!userProfile) throw Error('Unable to get user data');

        logger.info(
          'Starting notDeductedUserIds  :: leaveTable  :: ' +
            notDeductedUserIds[i],
        );

        const msg = MESSAGES.ERROR.ENTRY_FEE_DEDUCTED_MSG;
        const nonProdMsg = 'FAILED!';

        CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
          socket: userProfile.socketId,
          data: {
            isPopup: true,
            popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
            title: nonProdMsg,
            message: msg,
            tableId,
            buttonCounts: NUMERICAL.ONE,
            button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
            button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
            button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
          },
        });

        const socketObj = {
          id: userProfile.socketId,
          eventMetaData: {
            userObjectId: userProfile._id,
            tableId: tableData._id,
            userId: userProfile.userId,
          },
        };

        await leaveTable(
          tableId,
          PLAYER_STATE.LEFT,
          socketObj,
          undefined,
          false,
        );
      }
    }

    if (!isMinPlayerEntryFeeDeducted) {
      return false;
    }

    logger.info(
      tableId,
      `Ending entryFeeDeductManage for tableId : ${tableId}`,
    );
    return true;
  } catch (error) {
    logger.error(
      tableId,
      error,
      ` table ${tableId} round ${currentRound} funciton entryFeeDeductManage`,
    );
    throw new Errors.CancelBattle(`entry Fee Deduct Manage failed `);
  }
}

export = entryFeeDeductManage;
