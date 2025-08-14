import Bull from 'bull';
import logger from '../../logger';
import {winOfRoundSetupTimerProcess} from '../processes';
import {getConfig} from '../../../config';
import {winOfRoundSetupTimerIf} from '../../interface/schedulerIf';
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

let roundStartTimerQueue: any;
if (NODE_ENV === 'PRODUCTION') {
  const {port, hostname, auth} = url.parse(REDIS_CONNECTION_URL);
  roundStartTimerQueue = new Bull('sendWinOfRoundEvent', {
    redis: {
      host: hostname || 'localhost',
      port: Number(port),
      db: Number(REDIS_DB),
    },
  });
} else {
  roundStartTimerQueue = new Bull(`sendWinOfRoundEvent`, {
    redis: log,
  });
}

const winOfRoundSetupTimer = async (data: winOfRoundSetupTimerIf) => {
  try {
    data =
      await Validator.schedulerValidator.winOfRoundSetupTimerValidator(data);
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    logger.info(data.tableId, '-- ');
    logger.info(data.tableId, options, 'winOfRoundSetupTimer ------ ');
    logger.info(data.tableId, '-- ');

    await roundStartTimerQueue.add(data, options);
  } catch (error) {
    logger.error('CATCH_ERROR : winOfRoundSetupTimer :: ', data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
  }
};

roundStartTimerQueue.process(winOfRoundSetupTimerProcess);

export = winOfRoundSetupTimer;
