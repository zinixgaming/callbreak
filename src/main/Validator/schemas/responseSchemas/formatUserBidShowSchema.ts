const Joi = require('joi');

const formatUserBidShowSchema = Joi.object().keys({
  seatIndex: Joi.number().integer().required().description('user Seat Index'),
  bid: Joi.number().integer().required().description('user Made Bid'),
});

export = formatUserBidShowSchema;
