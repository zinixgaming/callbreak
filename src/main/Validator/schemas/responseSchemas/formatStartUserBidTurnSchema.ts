import Joi from 'joi';

const formatStartUserBidTurnSchema = Joi.object()
  .keys({
    time: Joi.number().required().description('turn timer'),
    bid: Joi.number().description('default Bid Value'),
  })
  .unknown(true);

export = formatStartUserBidTurnSchema;
