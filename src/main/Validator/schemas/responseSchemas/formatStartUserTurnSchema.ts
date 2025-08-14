import Joi from 'joi';

const formatStartUserTurnSchema = Joi.object().keys({
  seatIndex: Joi.number().required().description('seat Index'),
  time: Joi.number().required().description('turn timer'),
  cardSequence: Joi.string().required().description('card Sequence'),
  // card: Joi.ar().description('pre defined card'),
  card: Joi.array()
    .items(Joi.string())
    .required()
    .description('user turn card'),
});

export = formatStartUserTurnSchema;
