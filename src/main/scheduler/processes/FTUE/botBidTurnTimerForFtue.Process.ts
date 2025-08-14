/* eslint-disable node/no-unsupported-features/es-syntax */
import logger from '../../../logger';
import CommonEventEmitter from '../../../commonEventEmitter';
import { BOT_BID_TURN_TIMER_FOR_FTUE } from '../../../../constants/eventEmitter';

const botBidTurnTimerForFtueProcess = async (job: any) => {
  try {
    logger.info(job.data, ' botBidTurnTimerForFtueProcess ------ ');

    CommonEventEmitter.emit(BOT_BID_TURN_TIMER_FOR_FTUE, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : botBidTurnTimerForFtueProcess', job, e);
    return undefined;
  }
};

export = botBidTurnTimerForFtueProcess;
