// const Joi = require("joi");
import Joi from "joi";

const createTableSchema = Joi.object()
  .keys({
    gameType: Joi.string().required().description("Game Type"),
    lobbyId: Joi.string().allow("").description("lobby id"),
    gameId: Joi.string().required().description("game id"),
    winningScores: Joi.array()
      .items(Joi.number())
      .required()
      .description("Winning Score"),
    totalRounds: Joi.number().required().description("total number of round"),
    gameStartTimer: Joi.number().required().description("Game start Timer"),
    userTurnTimer: Joi.number().required().description("User Turn Timer"),
    bootValue: Joi.number().required().description("Boot Ammount Of Playing"),
    isFTUE: Joi.boolean().required().description("tutorial playing flag"),
    winningAmount : Joi.string().required().description("winningAmount"),
    isUseBot : Joi.boolean().required().description("isUseBot")
  })
  .unknown(true);

export = createTableSchema;
