const Joi = require("joi");

const signUpSchema = Joi.object()
  .keys({
    userId: Joi.string().required().description("user id"),
    userName: Joi.string().required().description("user name"),
    lobbyId: Joi.string().required().allow("").description("lobby id"),
    isFTUE: Joi.boolean().required().description("tutorial flag"),
    gameId: Joi.string().required().description("game id"),
    fromBack: Joi.boolean()
      .default(false)
      .description("backGround ForGround App"),
    deviceId: Joi.string().required().description("device id"),
  })
  .unknown(true);

const userBidSchema = Joi.object()
  .keys({
    bid: Joi.number().required().description("number of bid"),
  })
  .unknown(true);

const throwCardSchema = Joi.object()
  .keys({
    card: Joi.string().required().description("card name"),
  })
  .unknown(true);

const leaveTableSchema = Joi.object()
  .keys({
    tableId: Joi.string().required().description("Table Id"),
    isLeaveFromScoreBoard : Joi.boolean().required().description("is Leave From Score Board")
  })
  .unknown(true);

const showScoreBoardSchema = Joi.object()
  .keys({
    tableId: Joi.string().required().description("Table Id"),
  })
  .unknown(true);

const userRejoinSchema = Joi.object()
  .keys({
    userId: Joi.number().required().description("User Id"),
  })
  .unknown(true);

const userJoinLobbySchema = Joi.object().keys({
  lobbyId: Joi.string().required().description("Lobby _id"),
});

const exportObject = {
  signUpSchema,
  userBidSchema,
  throwCardSchema,
  leaveTableSchema,
  showScoreBoardSchema,
  userRejoinSchema,
  userJoinLobbySchema,
};

export = exportObject;
