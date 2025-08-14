import logger from '../../logger';
import {
  getTableData,
  setTableData,
  getRoundTableData,
  setRoundTableData,
  getPlayerGamePlay,
  setPlayerGamePlay,
} from '../../gameTable/utils';
import {
  defaultRoundTableData,
  defaultPlayerGamePlayData,
} from '../../defaultData';
import {TABLE_STATE, NUMERICAL} from '../../../constants';
import Scheduler from '../../scheduler';
import {playingTableIf} from '../../interface/playingTableIf';
import {roundTableIf} from '../../interface/roundTableIf';
import cancelBattle from '../cancelBattle';
import Errors from '../../errors';

// management All User and Round Data for next Round
const startNewRound = async (tableId: string, tie: boolean) => {
  logger.info(tableId, 'startNewRound : tableId :: ', tableId);
  logger.info(tableId, '<<===== startNewRound : tableId :: =====>> ', tableId);

  const {getLock} = global;
  const startNewRoundLock = await getLock.acquire([tableId], 2000);
  try {
    const playingTable: playingTableIf = await getTableData(tableId);
    const {currentRound} = playingTable;
    const roundPlayingTable: roundTableIf = await getRoundTableData(
      tableId,
      currentRound,
    );
    logger.info(
      tableId,
      'startNewRound : roundPlayingTable :: ',
      roundPlayingTable,
    );
    // re-set up playing data for next round
    const tempRoundPlayingTable: roundTableIf = await defaultRoundTableData({
      tableId,
      noOfPlayer: roundPlayingTable.noOfPlayer,
      currantRound: roundPlayingTable.currentRound,
    });
    logger.info(
      tableId,
      'startNewRound : tempRoundPlayingTable :: ',
      tempRoundPlayingTable,
    );
    // playingTable.totalRounds += 1; // call break are fix round
    playingTable.currentRound += 1;
    const seats = roundPlayingTable.seats;
    tempRoundPlayingTable.seats = seats;
    tempRoundPlayingTable.tableState = TABLE_STATE.ROUND_TIMER_STARTED;
    // tempRoundPlayingTable.currentRound = playingTable.currentRound;
    tempRoundPlayingTable.totalPlayers = roundPlayingTable.totalPlayers;
    tempRoundPlayingTable.isTieRound = roundPlayingTable.isTieRound;
    tempRoundPlayingTable.currentTieRound = roundPlayingTable.currentTieRound;
    tempRoundPlayingTable.dealerPlayer = roundPlayingTable.dealerPlayer;

    if (tie || tempRoundPlayingTable.isTieRound) {
      tempRoundPlayingTable.isTieRound = true;
      tempRoundPlayingTable.currentTieRound += 1;
    }
    tempRoundPlayingTable.tableCurrentTimer = Number(new Date());
    logger.info(
      tableId,
      'startNewRound :: tempRoundPlayingTable :: >> ',
      tempRoundPlayingTable,
    );

    await setRoundTableData(
      tableId,
      playingTable.currentRound,
      tempRoundPlayingTable,
    );
    await setTableData(playingTable);

    // re-set up user data for next round
    const promises = await Promise.all(
      Object.keys(seats).map(async key =>
        getPlayerGamePlay(seats[key].userId, tableId),
      ),
    );
    promises.filter(async user => {
      const tempPlayerGameData = await defaultPlayerGamePlayData(user);
      tempPlayerGameData.userObjectId = user.userObjectId;
      tempPlayerGameData.userId = user.userId;
      tempPlayerGameData.bags = user.bags;
      tempPlayerGameData.point = user.point;
      tempPlayerGameData.turnTimeout = user.turnTimeout;
      tempPlayerGameData.isAuto = user.isAuto;
      tempPlayerGameData.isLeft = user.isLeft;
      tempPlayerGameData.isBot = user.isBot;
      await setPlayerGamePlay(user.userId, tableId, tempPlayerGameData);
    });

    // set Scheduler for start Next Round
    await Scheduler.addJob.roundStartTimer({
      timer: (NUMERICAL.ZERO + NUMERICAL.ZERO) * NUMERICAL.FIVE_HUNDRED, // in milliseconds
      jobId: tableId,
      tableId,
      roundTableData: tempRoundPlayingTable,
      tableData: playingTable,
    });
    logger.info(tableId, 'startNewRound :::: new Round Start :::::');
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : startNewRound : tableId: ${tableId} :: tie:${tie} :: `,
      e,
    );
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    await getLock.release(startNewRoundLock);
  }
};

export = startNewRound;
