import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import {PLAYER_TURN_TIMER_EXPIRED} from '../../../constants/eventEmitter';

const playerTurnTimerProcess = async (job: any) => {
  try {
    logger.info(job.data, ' playerTurnTimerProcess ------ ');

    CommonEventEmitter.emit(PLAYER_TURN_TIMER_EXPIRED, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : playerTurnTimerProcess', job, e);
    return undefined;
  }
};

export = playerTurnTimerProcess;
