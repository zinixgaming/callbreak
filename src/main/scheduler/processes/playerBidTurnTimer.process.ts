import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import {PLAYER_BID_TURN_TIMER_EXPIRED} from '../../../constants/eventEmitter';

const playerBidTurnTimerProcess = async (job: any) => {
  try {
    logger.info(job.data, ' playerBidTurnTimerProcess ------ ');

    CommonEventEmitter.emit(PLAYER_BID_TURN_TIMER_EXPIRED, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : playerBidTurnTimerProcess', job, e);
    return undefined;
  }
};

export = playerBidTurnTimerProcess;
