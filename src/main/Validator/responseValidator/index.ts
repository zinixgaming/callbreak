const Joi = require("joi");
import logger from "../../logger";
import Errors from "../../errors";
import {
  formatCardDistributionSchema,
  formatCollectBootValueSchema,
  formatGameTableInfoSchema,
  formatJoinTableInfoSchema,
  formatRejoinTableInfoSchema,
  formatShowScoreBoardSchema,
  formatSingUpInfoSchema,
  formatStartUserBidTurnSchema,
  formatStartUserTurnSchema,
  formatUserBidShowSchema,
  formatUserThrowCardShowSchema,
  formatWinnerDeclareSchema,
} from "../schemas/responseSchemas";
import {
  formantUserThrowCardShowIf,
  formatCardDistributionIf,
  formatCollectBootValueIf,
  formatGameTableInfoIf,
  formatJoinTableInfoIf,
  formatRejoinTableInfoIf,
  formatSingUpInfoIf,
  formatStartUserBidTurnIf,
  formatStartUserTurnIf,
  formatWinnerDeclareIf,
  formentUserBidShowIf,
} from "../../interface/responseIf";
import { roundScoreIf } from "../../interface/userScoreIf";

async function formatCardDistributionValidator(
  data: formatCardDistributionIf
): Promise<formatCardDistributionIf> {
  try {
    Joi.assert(data, formatCardDistributionSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatCardDistributionValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}
async function formatCollectBootValueValidator(
  data: formatCollectBootValueIf
): Promise<formatCollectBootValueIf> {
  try {
    Joi.assert(data, formatCollectBootValueSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatCollectBootValueValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}
async function formatGameTableInfoValidator(
  data: formatGameTableInfoIf
): Promise<formatGameTableInfoIf> {
  try {
    Joi.assert(data, formatGameTableInfoSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatGameTableInfoValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}
async function formatJoinTableInfoValidator(
  data: formatJoinTableInfoIf
): Promise<formatJoinTableInfoIf> {
  try {
    Joi.assert(data, formatJoinTableInfoSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatJoinTableInfoValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}
async function formatRejoinTableInfoValidator(
  data: formatRejoinTableInfoIf
): Promise<formatRejoinTableInfoIf> {
  try {
    Joi.assert(data, formatRejoinTableInfoSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatRejoinTableInfoValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}
async function formatSingUpInfoValidator(
  data: formatSingUpInfoIf
): Promise<formatSingUpInfoIf> {
  try {
    Joi.assert(data, formatSingUpInfoSchema);
    return data;
  } catch (error) {
    logger.error(data.userId,
      "CATCH_ERROR : formatSingUpInfoValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

async function formatStartUserBidTurnValidator(
  data: formatStartUserBidTurnIf
): Promise<formatStartUserBidTurnIf> {
  try {
    Joi.assert(data, formatStartUserBidTurnSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatStartUserBidTurnValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}
async function formatStartUserTurnValidator(
  data: formatStartUserTurnIf
): Promise<formatStartUserTurnIf> {
  try {
    Joi.assert(data, formatStartUserTurnSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatStartUserTurnValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}
async function formatWinnerDeclareValidator(
  data: formatWinnerDeclareIf
): Promise<formatWinnerDeclareIf> {
  try {
    Joi.assert(data, formatWinnerDeclareSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatWinnerDeclareValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}
async function formatShowScoreBoardValidator(
  data: roundScoreIf
): Promise<roundScoreIf> {
  try {
    Joi.assert(data, formatShowScoreBoardSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatShowScoreBoardValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}
async function formatUserBidShowValidator(
  data: formentUserBidShowIf
): Promise<formentUserBidShowIf> {
  try {
    Joi.assert(data, formatUserBidShowSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatUserBidShowValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}
async function formatUserThrowCardShowValidator(
  data: formantUserThrowCardShowIf
): Promise<formantUserThrowCardShowIf> {
  try {
    Joi.assert(data, formatUserThrowCardShowSchema);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatUserThrowCardShowValidator :: ",
      error,
      " - ",
      data
    );
    throw new Errors.CancelBattle(error);
  }
}

const exportObject = {
  formatCardDistributionValidator,
  formatCollectBootValueValidator,
  formatGameTableInfoValidator,
  formatJoinTableInfoValidator,
  formatRejoinTableInfoValidator,
  formatSingUpInfoValidator,
  formatStartUserBidTurnValidator,
  formatStartUserTurnValidator,
  formatWinnerDeclareValidator,
  formatShowScoreBoardValidator,
  formatUserBidShowValidator,
  formatUserThrowCardShowValidator,
};
export = exportObject;
