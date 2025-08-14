import Bull from 'bull';
import logger from '../../logger';
import {leaveTableTimerProcess} from '../processes';
import {getConfig} from '../../../config';
import Errors from '../../errors';
import url from 'url';

const {
  SCHEDULER_REDIS_PORT,
  REDIS_DB,
  SCHEDULER_REDIS_HOST,
  SCHEDULER_REDIS_PASSWORD,
  REDIS_CONNECTION_URL,
  NODE_ENV,
} = getConfig();
const log: {host: string; port: number; password?: string; db?: number} = {
  host: SCHEDULER_REDIS_HOST,
  port: SCHEDULER_REDIS_PORT,
  db: REDIS_DB,
};
if (SCHEDULER_REDIS_PASSWORD !== '') log.password = SCHEDULER_REDIS_PASSWORD;
if (REDIS_DB !== '') log.db = REDIS_DB;

let tableSnapshotQueue: any;
if (NODE_ENV === 'PRODUCTION') {
  const {port, hostname, auth} = url.parse(REDIS_CONNECTION_URL);
  tableSnapshotQueue = new Bull('timeOutLeaveTable', {
    redis: {
      host: hostname || 'localhost',
      port: Number(port),
      db: Number(REDIS_DB),
    },
  });
} else {
  tableSnapshotQueue = new Bull(`timeOutLeaveTable`, {
    redis: log,
  });
}

const leaveTableTimer = async (data: any) => {
  try {
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    logger.info(data.tableId, '-- ');
    logger.info(
      data.tableId,
      options,
      'leaveTableTimer ------ ',
      options.delay,
    );
    logger.info(data.tableId, '-- ');

    await tableSnapshotQueue.add(data, options);
  } catch (error) {
    logger.error('CATCH_ERROR : leaveTableTimer :: ', data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
  }
};

tableSnapshotQueue.process(leaveTableTimerProcess);

export = leaveTableTimer;
