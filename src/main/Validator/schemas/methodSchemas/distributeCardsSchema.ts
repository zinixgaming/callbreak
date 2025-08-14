import playerGamePlaySchema from './playerGamePlaySchema';

import Joi from 'joi';

const distributeCardsSchema = Joi.array()
  .items(playerGamePlaySchema)
  .required();

export = distributeCardsSchema;
