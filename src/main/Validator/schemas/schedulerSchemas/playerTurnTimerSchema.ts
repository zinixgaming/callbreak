const Joi = require('joi');
import { playingTableSchema, playerGamePlaySchema } from '../methodSchemas';

const playerTurnTimerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  jobId: Joi.string().description('queue job id'),
  tableData: playingTableSchema,
  playerGamePlay: playerGamePlaySchema,
  isAutoMode : Joi.boolean().description('isAutoMode')
});

export = playerTurnTimerSchema;
