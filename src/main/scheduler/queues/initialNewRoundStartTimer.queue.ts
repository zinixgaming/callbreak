// initialNewRoundStartTimer;
import Bull from 'bull';
import logger from '../../logger';
import {initialNewRoundStartTimerProcess} from '../processes';
import {getConfig} from '../../../config';
import {initialNewRoundStartTimerIf} from '../../interface/schedulerIf';
import Validator from '../../Validator';
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
  tableSnapshotQueue = new Bull('newRoundStartTimer', {
    redis: {
      host: hostname || 'localhost',
      port: Number(port),
      db: Number(REDIS_DB),
    },
  });
} else {
  tableSnapshotQueue = new Bull(`newRoundStartTimer`, {
    redis: log,
  });
}

const initialNewRoundStartTimer = async (data: initialNewRoundStartTimerIf) => {
  try {
    data =
      await Validator.schedulerValidator.initialNewRoundStartTimerValidator(
        data,
      );
    const options = {
      delay: data.timer, // in ms
      jobId: data.tableId,
      removeOnComplete: true,
    };

    logger.info(data.tableId, '-- ');
    logger.info(data.tableId, options, 'initialNewRoundStartTimer ------ ');
    logger.info(data.tableId, '-- ');

    await tableSnapshotQueue.add(data, options);
  } catch (error) {
    logger.error(
      data.tableId,
      'CATCH_ERROR : initialNewRoundStartTimer :: ',
      data,
      error,
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
  }
};

tableSnapshotQueue.process(initialNewRoundStartTimerProcess);

export = initialNewRoundStartTimer;
