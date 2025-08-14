import Bull from 'bull';
import logger from '../../logger';
import {rejoinTimerProcess} from '../processes';
import {getConfig} from '../../../config';
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
  tableSnapshotQueue = new Bull('rejoinTimer', {
    redis: {
      host: hostname || 'localhost',
      port: Number(port),
      db: Number(REDIS_DB),
    },
  });
} else {
  tableSnapshotQueue = new Bull(`rejoinTimer`, {
    redis: log,
  });
}

const rejoinTimer = async (data: any) => {
  const options = {
    delay: data.timer, // in ms
    jobId: data.jobId,
    removeOnComplete: true,
  };

  logger.info('-- ');
  logger.info(options, 'rejoinTimer ------ ');
  logger.info('-- ');

  await tableSnapshotQueue.add(data, options);
};

tableSnapshotQueue.process(rejoinTimerProcess);

export = rejoinTimer;
