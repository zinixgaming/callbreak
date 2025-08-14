const Joi = require('joi');

const winOfRoundSetupTimerSchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  jobId: Joi.string().description('user queue Key'),
  tableId: Joi.string().description('table Id'),
});

export = winOfRoundSetupTimerSchedulerSchema;
