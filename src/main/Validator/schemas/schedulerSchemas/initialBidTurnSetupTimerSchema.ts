import Joi from 'joi';
import {playingTableSchema, playerGamePlaySchema} from '../methodSchemas';

const initialBidTurnSetupTimerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  jobId: Joi.string().description('queue job id'),
  tableData: playingTableSchema,
  playerGamePlayData: Joi.array()
    .items(playerGamePlaySchema)
    .required()
    .description('Playing User Detail'),
  nextTurn: Joi.string().description('current turn user id'),
  dealerIndex: Joi.number().description('exipire time'),
  dealerId: Joi.string().allow('').description('exipire time'),
});

export = initialBidTurnSetupTimerSchema;
