import Joi from 'joi';
import logger from '../../logger';
import {userIf} from '../../interface/userSignUpIf';
import Errors from '../../errors';
import {
  createTableSchema,
  userDetailSchema,
  roundTableSchema,
  playerGamePlaySchema,
  rejoinTableHistorySchema,
  playingTableSchema,
  chooseDealerSchema,
  distributeCardsSchema,
  checkWinnerOfRoundSchema,
  checkWinnerSchema,
} from '../schemas/methodSchemas';
import {
  defaultPlayingTableIf,
  playingTableIf,
  RejoinTableHistoryIf,
} from '../../interface/playingTableIf';
import {roundTableIf, userSeatsIf} from '../../interface/roundTableIf';
import {playerPlayingDataIf} from '../../interface/playerPlayingTableIf';
import {userScoreIf} from '../../interface/userScoreIf';

async function userDetailValidator(data: userIf): Promise<userIf> {
  try {
    Joi.assert(data, userDetailSchema);
    return data;
  } catch (error) {
    logger.error(
      data._id,
      'CATCH_ERROR : userDetailValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.InvalidInput(error);
  }
}

async function createTableValidator(
  data: defaultPlayingTableIf,
): Promise<defaultPlayingTableIf> {
  try {
    Joi.assert(data, createTableSchema);
    return data;
  } catch (error) {
    logger.error('CATCH_ERROR : createTableValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}

async function roundTableValidator(data: roundTableIf): Promise<roundTableIf> {
  try {
    Joi.assert(data, roundTableSchema);
    return data;
  } catch (error) {
    logger.error(
      data.tableId,
      'CATCH_ERROR : roundTableValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function playerGamePlayValidator(
  data: playerPlayingDataIf,
): Promise<playerPlayingDataIf> {
  try {
    Joi.assert(data, playerGamePlaySchema);
    return data;
  } catch (error) {
    logger.error('CATCH_ERROR : playerGamePlayValidator :: ', error, '-', data);
    throw new Errors.CancelBattle(error);
  }
}

async function rejoinTableHistoryValidator(
  data: RejoinTableHistoryIf,
): Promise<RejoinTableHistoryIf> {
  try {
    Joi.assert(data, rejoinTableHistorySchema);
    return data;
  } catch (error) {
    logger.error(
      data.tableId,
      'CATCH_ERROR : rejoinTableHistoryValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function playingTableValidator(
  data: playingTableIf,
): Promise<playingTableIf> {
  try {
    Joi.assert(data, playingTableSchema);
    return data;
  } catch (error) {
    logger.error(
      data._id,
      'CATCH_ERROR : playingTableValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}
async function chooseDealerValidator(data: userSeatsIf): Promise<userSeatsIf> {
  try {
    Joi.assert(data, chooseDealerSchema);
    return data;
  } catch (error) {
    logger.error('CATCH_ERROR : chooseDealerValidator :: ', error, '-', data);
    throw new Errors.CancelBattle(error);
  }
}

async function getNextPlayerValidator(data: userSeatsIf): Promise<userSeatsIf> {
  try {
    Joi.assert(data, chooseDealerSchema);
    return data;
  } catch (error) {
    logger.error('CATCH_ERROR : getNextPlayerValidator :: ', error, '-', data);
    throw new Errors.CancelBattle(error);
  }
}

async function distributeCardsValidator(
  data: playerPlayingDataIf[],
): Promise<playerPlayingDataIf[]> {
  try {
    Joi.assert(data, distributeCardsSchema);
    return data;
  } catch (error) {
    logger.error(
      'CATCH_ERROR : distributeCardsValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function checkWinnerOfRoundValidator(
  data: roundTableIf,
): Promise<roundTableIf> {
  try {
    Joi.assert(data, checkWinnerOfRoundSchema);
    return data;
  } catch (error) {
    logger.error(
      data._id,
      'CATCH_ERROR : checkWinnerOfRoundValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function checkWinnerValidator(
  data: userScoreIf[],
): Promise<userScoreIf[]> {
  try {
    Joi.assert(data, checkWinnerSchema);
    return data;
  } catch (error) {
    logger.error('CATCH_ERROR : checkWinnerValidator :: ', error, '-', data);
    throw new Errors.CancelBattle(error);
  }
}
const exportObject = {
  userDetailValidator,
  createTableValidator,
  roundTableValidator,
  playerGamePlayValidator,
  rejoinTableHistoryValidator,
  playingTableValidator,
  chooseDealerValidator,
  distributeCardsValidator,
  getNextPlayerValidator,
  checkWinnerOfRoundValidator,
  checkWinnerValidator,
};
export = exportObject;
