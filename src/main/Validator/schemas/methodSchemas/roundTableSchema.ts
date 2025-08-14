const Joi = require("joi");
import seatsSchema from "./seatsSchema";

const roundTableSchema = Joi.object()
  .keys({
    _id: Joi.string().required().description("Round Unique Id"),
    tableId: Joi.string().required().description("Table Unique Id"),
    tableState: Joi.string().required().description("Game Status"),
    tableCurrentTimer: Joi.date()
      .required()
      .allow(null)
      .description("Turn Timer"),
    totalPlayers: Joi.number().required().description("Player Count"),
    noOfPlayer: Joi.string().required().description("Allow Player"),
    currentRound: Joi.number().required().description("Round Number"),
    totalHands: Joi.number().required().description("Number of Hands"),
    seats: seatsSchema,
    turnCurrentCards: Joi.array().required().description("Turn Card"),
    turnCardSequence: Joi.string().required().description("turn Sequence Card"),
    lastInitiater: Joi.string()
      .required()
      .allow(null)
      .description("first throw card user id"),
    dealerPlayer: Joi.string().allow(null).description("Dealer User Id"),
    breakingSpades: Joi.boolean().required().description("Breaking Spades"),
    hands: Joi.array().required().description("Turn Cards"),
    turnCount: Joi.number().required().description("Total Turn Count"),
    handCount: Joi.number().required().description("Total Hand Count"),
    currentTurn: Joi.string().allow(null).description("User Id"),
    isTieRound: Joi.boolean().required().description("is Tie Round"),
    currentTieRound: Joi.number().required().description("Number Of Tie Round"),
    isBidTurn: Joi.boolean().allow(null).description("bit turn start or end"),
    currentTurnTimer: Joi.number().allow(null).description("turn timer"),
  })
  .unknown(true);

export = roundTableSchema;
