const Joi = require("joi");

const formatJoinTableInfoSchema = Joi.object().keys({
  totalPlayers: Joi.number().required().description("total Player"),
  playarDetail: Joi.object().keys({
    seatIndex: Joi.number().required().description("seat Index"),
    userId: Joi.string().required().description("user Id"),
    username: Joi.string().required().allow("").description("user name"),
    profilePicture: Joi.string()
      .required()
      .allow("")
      .description("user profile pic"),
  }),
});

export = formatJoinTableInfoSchema;
