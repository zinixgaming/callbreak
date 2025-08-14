import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import {START_NEW_ROUND_TIMER} from '../../../constants/eventEmitter';

const initialNewRoundStartTimerProcess = async (job: any) => {
  try {
    logger.info(job.data, ' initialNewRoundStartTimerProcess ------ ');

    CommonEventEmitter.emit(START_NEW_ROUND_TIMER, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : initialNewRoundStartTimerProcess', job, e);
    return undefined;
  }
};

export = initialNewRoundStartTimerProcess;
