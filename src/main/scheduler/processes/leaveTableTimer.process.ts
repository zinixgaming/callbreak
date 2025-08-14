import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import {TIME_OUT_TO_LEAVE_TABLE} from '../../../constants/eventEmitter';

const leaveTableTimerProcess = async (job: any) => {
  try {
    logger.info(job.data, ' leaveTableTimerProcess ------ ');

    CommonEventEmitter.emit(TIME_OUT_TO_LEAVE_TABLE, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : leaveTableTimerProcess', job, e);
    return undefined;
  }
};

export = leaveTableTimerProcess;
