const Joi = require('joi');
import logger from '../../logger';
import {LobbyEntrySchema} from '../schemas/lobbySchemas';
import Errors from '../../errors';
import { createLobbyIF } from '../../interface/lobby';
import { setLobbyIf } from '../../interface/tableTrackingIf';


async function lobbyEntryValidator(data:setLobbyIf) {
  try {
    Joi.assert(data, LobbyEntrySchema);
    return data;
  } catch (error) {
    logger.error(data.tableId, 'CATCH_ERROR : lobbyEntryValidator :: ', error, '-', data);
    throw new Errors.InvalidInput(error);
  }
}

const exportObject = {
  lobbyEntryValidator
};

export = exportObject;
