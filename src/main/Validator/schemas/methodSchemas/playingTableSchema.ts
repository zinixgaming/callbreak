const Joi = require('joi');

const playingTableSchema = Joi.object()
  .keys({
    _id: Joi.string().required().description('Table Unique Id'),
    gameType: Joi.string().required().description('Game Type'),
    totalRounds: Joi.number().required().description('total Rounds'),
    currentRound: Joi.number().required().description('Current Rounds'),
    lobbyId: Joi.string().required().description('lobby id'),
    gameId: Joi.string().description('game id'),
    winningScores: Joi.array()
      .items(Joi.number())
      .required()
      .description('Winning Score'),
    gameStartTimer: Joi.number().required().description('Game start Timer'),
    userTurnTimer: Joi.number().required().description('User Turn Timer'),
    bootValue: Joi.number().required().description('Boot Ammount Of Playing'),
    potValue: Joi.number().required().description('pot Value'),
    winner: Joi.array().required().description('winner array'),
    isFTUE: Joi.boolean().required().description('tutorial playing flag'),
  })
  .unknown(true);

export = playingTableSchema;
