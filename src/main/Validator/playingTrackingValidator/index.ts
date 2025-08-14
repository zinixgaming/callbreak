import Joi from 'joi';
import logger from '../../logger';
import Errors from '../../errors';
import {createFlageSchema} from '../schemas/playingTrackingSchema';

async function playingTrackingFlageValidator(data: any) {
  try {
    Joi.assert(data, createFlageSchema);
    return data;
  } catch (error) {
    logger.error(
      'CATCH_ERROR : playingTrackingFlageValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.InvalidInput(error);
  }
}

const exportObject = {
  playingTrackingFlageValidator,
};

export = exportObject;
