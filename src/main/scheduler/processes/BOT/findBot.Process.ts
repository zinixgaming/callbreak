/* eslint-disable node/no-unsupported-features/es-syntax */
import logger from '../../../logger';
import CommonEventEmitter from '../../../commonEventEmitter';
import { FIND_BOT } from '../../../../constants/eventEmitter';

const findBotProcess = async (job: any) => {
  try {
    logger.info(job.data, ' findBotProcess ------ ');

    CommonEventEmitter.emit(FIND_BOT, job.data);

    return true;
  } catch (e) {
    logger.error('CATCH_ERROR : findBotProcess', job, e);
    return undefined;
  }
};

export = findBotProcess;
