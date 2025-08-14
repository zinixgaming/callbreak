const Joi = require('joi');

const findBotSchema = Joi.object().keys({
  timer: Joi.number().description('exipire time'),
  jobId: Joi.string().description('queue job id'),
  tableId: Joi.string().description('tableId'),
  gameConfig: Joi.object().keys({
    lobbyId: Joi.string().required().description('lobby id'),
    gameId: Joi.string().required().description('game id'),
    gameStartTimer: Joi.number().required().description('game start timer'),
    userTurnTimer: Joi.number().required().description('user turn timer'),
    entryFee: Joi.number().required().description('entry fee'),
    totalRound : Joi.number().required().description('totalRound'),
    minPlayer : Joi.string().required().description('minPlayer'),
    noOfPlayer : Joi.string().required().description('noOfPlayer'),
    winningAmount : Joi.string().required().description('winningAmount'),
    userAuthToken : Joi.string().required().description('user auth token'),
    isUseBot : Joi.boolean().required().description('isUseBot'),
    moneyMode : Joi.string().required().description('moneyMode'),
  }),
});

export = findBotSchema;
