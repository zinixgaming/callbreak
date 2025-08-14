import Joi from 'joi';

const initialNewRoundStartTimerSchedulerSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  jobId: Joi.string().description('user queue Key'),
  tableId: Joi.string().description('table Id'),
  tie: Joi.boolean().description('tie round started or not'),
});

export = initialNewRoundStartTimerSchedulerSchema;
