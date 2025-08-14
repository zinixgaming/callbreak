const Joi = require('joi');
import { playingTableSchema, playerGamePlaySchema } from '../methodSchemas';

const playerBidTurnTimerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  jobId: Joi.string().description('queue job id'),
  tableData: playingTableSchema,
}).unknown(true);

export = playerBidTurnTimerSchema;
