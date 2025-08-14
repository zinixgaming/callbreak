import logger from '../../logger';
import commonEventEmitter from '../../commonEventEmitter';
import {WIN_OF_ROUND_TIMER} from '../../../constants/eventEmitter';

const winOfRoundSetupTimerProcess = async (job: any) => {
  try {
    logger.debug(' winOfRoundSetupTimerProcess ----------->   event fire', job);

    commonEventEmitter.emit(WIN_OF_ROUND_TIMER, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : winOfRoundSetupTimerProcess', job, e);
    return undefined;
  }
};

export = winOfRoundSetupTimerProcess;
