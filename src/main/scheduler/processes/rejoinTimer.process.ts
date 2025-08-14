/* eslint-disable node/no-unsupported-features/es-syntax */
import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import { REJOIN_TIMER_EXPIRED } from '../../../constants/eventEmitter';

const rejoinTimerProcess = async (job: any) => {
  try {
    logger.info(job.data, ' rejoinTimerProcess ------ ');

    CommonEventEmitter.emit(REJOIN_TIMER_EXPIRED, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : rejoinTimerProcess', job, e);
    return undefined;
  }
};

export = rejoinTimerProcess;
