import seatsSchema from './seatsSchema';

import Joi from 'joi';

const chooseDealerSchema = Joi.object()
  .keys({
    s0: seatsSchema,
    s1: seatsSchema,
    s2: seatsSchema.optional(),
    s3: seatsSchema.optional(),
  })
  .unknown(true);

export = chooseDealerSchema;
