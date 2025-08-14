import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import {INITIAL_TURN_SETUP_TIMER_EXPIRED} from '../../../constants/eventEmitter';

const turnSetupTimerProcess = async (job: any) => {
  try {
    logger.info(job.data, ' turnSetupTimerProcess ------ ');

    CommonEventEmitter.emit(INITIAL_TURN_SETUP_TIMER_EXPIRED, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : turnSetupTimerProcess', job, e);
    return undefined;
  }
};

export = turnSetupTimerProcess;
