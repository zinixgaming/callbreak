/* eslint-disable node/no-unsupported-features/es-syntax */
import logger from '../../../logger';
import CommonEventEmitter from '../../../commonEventEmitter';
import { TACK_BOT_TURN } from '../../../../constants/eventEmitter';

const botTurnTimerProcess = async (job: any) => {
  try {
    logger.info(job.data, ' botTurnTimerProcess ------ ');

    CommonEventEmitter.emit(TACK_BOT_TURN, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : botTurnTimerProcess', job, e);
    return undefined;
  }
};

export = botTurnTimerProcess;
