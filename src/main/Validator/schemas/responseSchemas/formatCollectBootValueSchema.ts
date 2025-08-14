const Joi = require("joi");

const formatCollectBootValueSchema = Joi.object().keys({
  bootValue: Joi.number().required().description("boot value"),
  userIds: Joi.array().items(Joi.string()).required().description("User Id"),
  balance: Joi.array().items(Joi.object().keys({
    userId: Joi.string().required().description("User Id"),
    balance: Joi.number().required().description("balance after deduct boot value")
  }))
});

export = formatCollectBootValueSchema;
