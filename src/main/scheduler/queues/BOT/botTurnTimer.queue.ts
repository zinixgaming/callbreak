import Bull from 'bull';
import logger from '../../../logger';
import {botTurnTimerProcess} from '../../processes';
import {getConfig} from '../../../../config';
import Errors from '../../../errors';
import {playerTurnTimerIf} from '../../../interface/schedulerIf';
import Validator from '../../../Validator';
import {BULL} from '../../../../constants';
import url from 'url';

const {
  SCHEDULER_REDIS_PORT,
  SCHEDULER_REDIS_HOST,
  SCHEDULER_REDIS_PASSWORD,
  REDIS_DB,
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
  tableSnapshotQueue = new Bull(BULL.BOT_TURN, {
    redis: {
      host: hostname || 'localhost',
      port: Number(port),
      db: Number(REDIS_DB),
    },
  });
} else {
  tableSnapshotQueue = new Bull(BULL.BOT_TURN, {
    redis: log,
  });
}

const botTurnTimer = async (data: playerTurnTimerIf) => {
  try {
    data = await Validator.schedulerValidator.playerTurnTimerValidator(data);
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    logger.info('-- ');
    logger.info(options, 'botTurnTimer ------ ');
    logger.info('-- ');

    await tableSnapshotQueue.add(data, options);
  } catch (error) {
    logger.error('CATCH_ERROR : botTurnTimer :: ', data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
  }
};

tableSnapshotQueue.process(botTurnTimerProcess);

export = botTurnTimer;
