import Joi from 'joi';
import logger from '../../logger';
import {
  cardThrowRequestIf,
  leaveTableRequestIf,
  setBidRequestIf,
  signUpRequestIf,
  userRejoinRequestIf,
  userJoinLobbyRequestIf,
} from '../../interface/requestIf';
import Errors from '../../errors';
import {
  signUpSchema,
  userBidSchema,
  throwCardSchema,
  leaveTableSchema,
  showScoreBoardSchema,
  userRejoinSchema,
  userJoinLobbySchema,
} from '../schemas/requestSchemas';
import {showUserScoreIf} from '../../interface/userScoreIf';

async function signUpValidator(
  data: signUpRequestIf,
): Promise<signUpRequestIf> {
  try {
    Joi.assert(data, signUpSchema);
    return data;
  } catch (error) {
    logger.error(
      data.userId,
      'CATCH_ERROR : signUpValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.InvalidInput(error);
  }
}

async function userBidValidator(
  data: setBidRequestIf,
): Promise<setBidRequestIf> {
  try {
    Joi.assert(data, userBidSchema);
    return data;
  } catch (error) {
    logger.error('CATCH_ERROR : userBidValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}

async function throwCardValidator(
  data: cardThrowRequestIf,
): Promise<cardThrowRequestIf> {
  try {
    Joi.assert(data, throwCardSchema);
    return data;
  } catch (error) {
    logger.error('CATCH_ERROR : throwCardValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}

async function leaveTableValidator(
  data: leaveTableRequestIf,
): Promise<leaveTableRequestIf> {
  try {
    Joi.assert(data, leaveTableSchema);
    return data;
  } catch (error) {
    logger.error(
      data.tableId,
      'CATCH_ERROR : leaveTableValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.InvalidInput(error);
  }
}

async function showScoreValidator(
  data: showUserScoreIf,
): Promise<showUserScoreIf> {
  try {
    Joi.assert(data, showScoreBoardSchema);
    return data;
  } catch (error) {
    logger.error(
      data.tableId,
      'CATCH_ERROR : showScoreValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.InvalidInput(error);
  }
}

async function userRejoinValidator(
  data: userRejoinRequestIf,
): Promise<userRejoinRequestIf> {
  try {
    Joi.assert(data, userRejoinSchema);
    return data;
  } catch (error) {
    logger.error(
      data.userId,
      'CATCH_ERROR : userRejoinValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.InvalidInput(error);
  }
}

async function userLobbyJoinValidator(
  data: userJoinLobbyRequestIf,
): Promise<userJoinLobbyRequestIf> {
  try {
    Joi.assert(data, userJoinLobbySchema);
    return data;
  } catch (error) {
    logger.error(
      'CATCH_ERROR : userLobbyJoinValidator :: ',
      error,
      ' - ',
      data,
    );
    throw new Errors.InvalidInput(error);
  }
}

const exportObject = {
  signUpValidator,
  userBidValidator,
  throwCardValidator,
  leaveTableValidator,
  showScoreValidator,
  userRejoinValidator,
  userLobbyJoinValidator,
};

export = exportObject;
