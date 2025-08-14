const Joi = require('joi');
import logger from '../../logger';
import Errors from '../../errors';
import {
  findBotSchema,
  initialBidTurnSetupTimerSchema,
  initializeGameplaySchedulerSchema,
  initialNewRoundStartTimerSchedulerSchema,
  playerBidTurnTimerSchema,
  playerTurnTimerSchema,
  roundStartTimerSchedulerSchema,
  winOfRoundSetupTimerSchedulerSchema,
} from '../schemas/schedulerSchemas';
import {
  initialTurnSetupTimerIf,
  initializeGameplayIf,
  playerBidTurnTimerIf,
  roundStartTimerIf,
  winOfRoundSetupTimerIf,
  winnerDeclareTimerIf,
  initialNewRoundStartTimerIf,
  playerTurnTimerIf,
  findBotIf,
} from '../../interface/schedulerIf';

async function initializeGameplaySchedulerValidator(
  data: initializeGameplayIf,
): Promise<initializeGameplayIf> {
  try {
    Joi.assert(data, initializeGameplaySchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : initializeGameplaySchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function roundStartTimerSchedulerValidator(
  data: roundStartTimerIf,
): Promise<roundStartTimerIf> {
  try {
    Joi.assert(data, roundStartTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : roundStartTimerSchedulerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function initialBidTurnSetupTimerValidator(
  data: initialTurnSetupTimerIf,
): Promise<initialTurnSetupTimerIf> {
  try {
    Joi.assert(data, initialBidTurnSetupTimerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableData._id,
      'CATCH_ERROR : initialBidTurnSetupTimerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function playerBidTurnTimerValidator(
  data: playerBidTurnTimerIf,
): Promise<playerBidTurnTimerIf> {
  try {
    Joi.assert(data, playerBidTurnTimerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableData._id,
      'CATCH_ERROR : playerBidTurnTimerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function initialTurnSetupTimerValidator(
  data: initialTurnSetupTimerIf,
): Promise<initialTurnSetupTimerIf> {
  try {
    Joi.assert(data, initialBidTurnSetupTimerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableData._id,
      'CATCH_ERROR : initialTurnSetupTimerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function winOfRoundSetupTimerValidator(
  data: winOfRoundSetupTimerIf,
): Promise<winOfRoundSetupTimerIf> {
  try {
    Joi.assert(data, winOfRoundSetupTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : winOfRoundSetupTimerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function winnerDeclareTimerValidator(
  data: winnerDeclareTimerIf,
): Promise<winnerDeclareTimerIf> {
  try {
    Joi.assert(data, winOfRoundSetupTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(
      'CATCH_ERROR : winnerDeclareTimerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function initialNewRoundStartTimerValidator(
  data: initialNewRoundStartTimerIf,
): Promise<initialNewRoundStartTimerIf> {
  try {
    Joi.assert(data, initialNewRoundStartTimerSchedulerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId,
      'CATCH_ERROR : initialNewRoundStartTimerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function playerTurnTimerValidator(
  data: playerTurnTimerIf,
): Promise<playerTurnTimerIf> {
  try {
    Joi.assert(data, playerTurnTimerSchema);
    return data;
  } catch (error) {
    logger.error(data.tableData._id,
      'CATCH_ERROR : playerTurnTimerValidator :: ',
      error,
      '-',
      data,
    );
    throw new Errors.CancelBattle(error);
  }
}

async function findBotValidator(data: findBotIf): Promise<findBotIf> {
  try {
    Joi.assert(data, findBotSchema);
    return data;
  } catch (error) {
    logger.error(data.tableId, 'CATCH_ERROR : findBotValidator :: ', error, '-', data);
    throw new Errors.CancelBattle(error);
  }
}

const exportObject = {
  initializeGameplaySchedulerValidator,
  roundStartTimerSchedulerValidator,
  initialBidTurnSetupTimerValidator,
  playerBidTurnTimerValidator,
  initialTurnSetupTimerValidator,
  winOfRoundSetupTimerValidator,
  winnerDeclareTimerValidator,
  initialNewRoundStartTimerValidator,
  playerTurnTimerValidator,
  findBotValidator
};

export = exportObject;
