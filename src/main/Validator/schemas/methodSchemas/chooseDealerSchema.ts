import seatsSchema from './seatsSchema';

const Joi = require('joi');

const chooseDealerSchema = Joi.object()
  .keys({
    s0: seatsSchema,
    s1: seatsSchema,
    s2: seatsSchema.optional(),
    s3: seatsSchema.optional(),
  })
  .unknown(true);

export = chooseDealerSchema;
