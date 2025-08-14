const Joi = require("joi");

const checkWinnerSchema = Joi.array().items({
  username: Joi.string().required().allow("").description("user naem"),
  profilePicture: Joi.string()
    .allow("")
    .required()
    .description("User Profile Pic"),
  userId: Joi.string().required().description("user Id"),
  seatIndex: Joi.number().required().description("user seat index"),
  bid: Joi.number().required().description("number of bid"),
  hands: Joi.number().required().description("number of hands"),
  isLeft: Joi.boolean().required().description("user left or not"),
  isAuto : Joi.boolean().required().description("user auto or not"),
  roundBags: Joi.number()
    .required()
    .description("current round number of bags"),
  roundPoint: Joi.number()
    .required()
    .description("current round number of point"),
  totalBags: Joi.number().required().description("total number of bags"),
  BagsPenalty: Joi.number().required().description("bags penalty"),
  totalPoint: Joi.number().required().description("sum of all point"),
});

export = checkWinnerSchema;
