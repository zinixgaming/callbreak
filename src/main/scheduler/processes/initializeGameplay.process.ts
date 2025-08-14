import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import {INITIALIZE_GAME_PLAY} from '../../../constants/eventEmitter';

const initializeGameplayProcess = async (job: any) => {
  try {
    logger.info(job.data, ' initializeGameplayProcess ------ ');

    CommonEventEmitter.emit(INITIALIZE_GAME_PLAY, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : initializeGameplayProcess :: ', job, e);
    return undefined;
  }
};

export = initializeGameplayProcess;
