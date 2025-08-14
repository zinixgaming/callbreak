import {NUMERICAL} from '../../../../constants';
import Scheduler from '../../../scheduler';
import {
  getPlayerGamePlay,
  getTableData,
  getRoundTableData,
} from '../../../gameTable/utils';
import {playerPlayingDataIf} from '../../../interface/playerPlayingTableIf';
import logger from '../../../logger';

const startManuallyTurn = async (socket: any) => {
  logger.info('startManuallyTurn :: call ::');
  const {tableId} = socket.eventMetaData;
  logger.info('startManuallyTurn :: call :: tableId', tableId);

  const tableData = await getTableData(tableId);
  logger.info('startManuallyTurn :: call :: tableData', tableData);
  const {currentRound} = tableData;
  const roundData = await getRoundTableData(tableId, currentRound);
  logger.info('startManuallyTurn :: call :: roundData', roundData);

  const {userId} = roundData.seats.s0;
  const {lastInitiater} = roundData;

  const playerGamePlayData: playerPlayingDataIf[] = await Promise.all(
    Object.keys(roundData.seats).map(
      async key =>
        await getPlayerGamePlay(roundData.seats[key].userId, tableId),
    ),
  );
  logger.info(
    'startManuallyTurn :: call ::: playerGamePlayData',
    playerGamePlayData,
  );

  await Scheduler.addJob.initialTurnSetupTimer({
    timer: NUMERICAL.ZERO * NUMERICAL.FIVE_HUNDRED,
    jobId: `${tableId}:${tableData.currentRound}`,
    tableData,
    playerGamePlayData,
    nextTurn: lastInitiater ? lastInitiater : userId ? userId : -1,
  });

  return true;
};
export = startManuallyTurn;
