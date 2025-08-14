const Joi = require('joi');
import { playingTableSchema, roundTableSchema } from '../methodSchemas';

const initializeGameplaySchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  queueKey: Joi.string().description('user queue Key'),
  tableId: Joi.string().description('table Id'),
  tableData: playingTableSchema,
  roundTableData: roundTableSchema,
});

export = initializeGameplaySchedulerSchema;
