import logger from '../../logger';
import commonEventEmitter from '../../commonEventEmitter';
import {ROUND_STARTED} from '../../../constants/eventEmitter';

const roundStartTimerProcess = async (job: any) => {
  try {
    logger.debug(' roundStartTimerProcess ----------->   event fire', job);

    commonEventEmitter.emit(ROUND_STARTED, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : roundStartTimerProcess', job, e);
    return undefined;
  }
};

export = roundStartTimerProcess;
