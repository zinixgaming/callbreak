import logger from '../../logger';
import leaveTable from '../leaveTable/index';
import Scheduler from '../../scheduler';

// start timer for cancel rejoin timer
const rejoinTableTimerExpire = async (data: any) => {
  const tableId = data.tableId;
  const userId = data.userId;
  const socket = data.socket;
  try {
    await Scheduler.cancelJob.rejoinTimerCancel(`${tableId}:${userId}`);

    leaveTable(tableId, 'DISCONECT', socket);
  } catch (e) {
    logger.error(tableId, 
      `CATCH_ERROR : rejoinTableTimerExpire :: tableId: ${tableId} :: userId: ${userId}`,
      data,
      e,
    );
  }
};
export = rejoinTableTimerExpire;
