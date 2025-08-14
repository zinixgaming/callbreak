import Bull from 'bull';
import logger from '../../logger';
import {playerTurnTimerProcess} from '../processes';
import {getConfig} from '../../../config';
import Errors from '../../errors';
import {playerTurnTimerIf} from '../../interface/schedulerIf';
import Validator from '../../Validator';
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
  tableSnapshotQueue = new Bull('startTurnTimer', {
    redis: {
      host: hostname || 'localhost',
      port: Number(port),
      db: Number(REDIS_DB),
    },
  });
} else {
  tableSnapshotQueue = new Bull(`startTurnTimer`, {
    redis: log,
  });
}

const playerTurnTimer = async (data: playerTurnTimerIf) => {
  try {
    data = await Validator.schedulerValidator.playerTurnTimerValidator(data);
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    logger.info(data.tableData._id, '-- ');
    logger.info(data.tableData._id, options, 'playerTurnTimer ------ ');
    logger.info(data.tableData._id, '-- ');

    await tableSnapshotQueue.add(data, options);
  } catch (error) {
    logger.error(
      data.tableData._id,
      'CATCH_ERROR : playerTurnTimer :: ',
      data,
      error,
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
  }
};

tableSnapshotQueue.process(playerTurnTimerProcess);

export = playerTurnTimer;
