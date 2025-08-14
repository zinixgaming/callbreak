/* eslint-disable node/no-unsupported-features/es-syntax */
import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import { INITIAL_BID_TURN_SETUP_TIMER_EXPIRED } from '../../../constants/eventEmitter';

const turnBidSetupTimerProcess = async (job: any) => {
  try {
    logger.info(job.data, ' turnBidSetupTimerProcess ------ ');

    CommonEventEmitter.emit(INITIAL_BID_TURN_SETUP_TIMER_EXPIRED, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : turnBidSetupTimerProcess', job, e);
    return undefined;
  }
};

export = turnBidSetupTimerProcess;
