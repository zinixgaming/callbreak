import Joi from 'joi';

const userDetailSchema = Joi.object()
  .keys({
    _id: Joi.string().required().description('user Unique Id'),
    isFTUE: Joi.boolean().description('tutorial flag'),
    username: Joi.string().required().allow('').description('user naem'),
    deviceId: Joi.string().required().allow('').description('device Unique Id'),
    fromBack: Joi.boolean()
      .default(false)
      .description('backGround ForGround App'),
    lobbyId: Joi.string().required().allow('').description('lobby id'),
    gameId: Joi.string().required().description('game id'),
    startTime: Joi.number().required().description('Start Timer'),
    balance: Joi.number().required().allow(null).description('user balance'),
    userId: Joi.string().required().description('user Unique Id'),
    tableId: Joi.string().allow('').description('user playing table id'),
    profilePicture: Joi.string()
      .required()
      .allow('')
      .description('User Profile Pic'),
    totalRound: Joi.number().required().description('total game Round'),
    minPlayer: Joi.string().required().description('minPlayer'),
    noOfPlayer: Joi.string().required().description('noOfPlayer'),
    winningAmount: Joi.string().required().description('winningAmount'),
    gameStartTimer: Joi.number().required().description('Game start Timer'),
    userTurnTimer: Joi.number().required().description('User Turn Timer'),
    entryFee: Joi.number().required().description('Boot Ammount Of Playing'),
    authToken: Joi.string().required().description('Unique Auth Token'),
    socketId: Joi.string().required().description('User SocketId'),
    isUseBot: Joi.boolean().required().description('isUseBot'),
    isBot: Joi.boolean().required().description('isBot yer or not'),
    moneyMode: Joi.string().required().description('moneyMode'),
    isAnyRunningGame: Joi.boolean().description('isAnyRunningGame'),
  })
  .unknown(true);

export = userDetailSchema;
