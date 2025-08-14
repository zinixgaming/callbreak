const Bull = require('bull');
import logger from '../../../logger';
import { findBotProcess } from '../../processes';
import { getConfig } from '../../../../config';
import Errors from '../../../errors';
import {
  findBotIf,
} from '../../../interface/schedulerIf';
import Validator from '../../../Validator';
import { BULL } from '../../../../constants';
import url from "url"

const {
  SCHEDULER_REDIS_PORT,
  SCHEDULER_REDIS_HOST,
  SCHEDULER_REDIS_PASSWORD,
  REDIS_DB,
  REDIS_CONNECTION_URL,
  NODE_ENV
} = getConfig();


const log: { host: string; port: number; password?: string; db?: number } = {
  host: SCHEDULER_REDIS_HOST,
  port: SCHEDULER_REDIS_PORT,
  db: REDIS_DB
};

if (SCHEDULER_REDIS_PASSWORD !== '') log.password = SCHEDULER_REDIS_PASSWORD;
if (REDIS_DB !== '') log.db = REDIS_DB;

let tableSnapshotQueue: any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  tableSnapshotQueue = new Bull(BULL.FIND_BOT, {redis : {host : hostname, port:port, db : Number(REDIS_DB)} });
} else {
  tableSnapshotQueue = new Bull(BULL.FIND_BOT, {
    redis: log,
  });
}

const findBotTimer = async (data: findBotIf) => {
  try {
    data = await Validator.schedulerValidator.findBotValidator(data);
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    logger.info('-- ');
    logger.info(options, 'findBotTimer ------ ');
    logger.info('-- ');

    await tableSnapshotQueue.add(data, options);
  } catch (error) {
    logger.error('CATCH_ERROR : findBotTimer :: ', data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
  }
};

tableSnapshotQueue.process(findBotProcess);

export = findBotTimer;
