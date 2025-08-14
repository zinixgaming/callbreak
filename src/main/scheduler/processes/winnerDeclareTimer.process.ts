import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import {WINNER_DECLARE_TIMER} from '../../../constants/eventEmitter';

const winnerDeclareTimerProcess = async (job: any) => {
  try {
    logger.info(job.data, ' winnerDeclareTimerProcess ------ ');

    CommonEventEmitter.emit(WINNER_DECLARE_TIMER, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : winnerDeclareTimerProcess', job, e);
    return undefined;
  }
};

export = winnerDeclareTimerProcess;
