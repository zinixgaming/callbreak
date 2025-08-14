import Joi from 'joi';

const formatCardDistributionSchema = Joi.object().keys({
  cards: Joi.array().items(Joi.string()).required().description('boot value'),
  dealer: Joi.number().required().description('dealer seat index'),
  currentRound: Joi.number().required().description('currentRound'),
});

export = formatCardDistributionSchema;
