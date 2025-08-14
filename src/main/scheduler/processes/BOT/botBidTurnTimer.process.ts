/* eslint-disable node/no-unsupported-features/es-syntax */
import logger from '../../../logger';
import CommonEventEmitter from '../../../commonEventEmitter';
import { TACK_BOT_BID_TURN } from '../../../../constants/eventEmitter';

const botBidTurnTimerProcess = async (job: any) => {
  try {
    logger.info(job.data, ' botBidTurnTimerProcess ------ ');

    CommonEventEmitter.emit(TACK_BOT_BID_TURN, job.data);
    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : botBidTurnTimerProcess', job, e);
    return undefined;
  }
};

export = botBidTurnTimerProcess;
