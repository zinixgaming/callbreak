// import Joi from 'joi';
import Joi from 'joi';

const playerGamePlaySchema = Joi.object()
  .keys({
    _id: Joi.string().required().description('user Unique Id'),
    userObjectId: Joi.string().required().description('user Unique Id'),
    userId: Joi.string().required().description('user Unique Id'),
    username: Joi.string().required().allow('').description('user naem'),
    profilePicture: Joi.string()
      .required()
      .allow('')
      .description('User Profile Pic'),
    roundTableId: Joi.string().required().description('round id'),
    seatIndex: Joi.number().required().description('seat index'),
    userStatus: Joi.string().required().description('playing status'),
    isFirstTurn: Joi.boolean().required().description('first user turn'),
    socketId: Joi.string().required().description('User SocketId'),
    currentCards: Joi.array().required().description('user All Card'),
    roundCards: Joi.array().required().description('user All Card'),
    turnTimeout: Joi.number().required().description('lobby user turn timer'),
    bid: Joi.number().required().description('user set bid'),
    bidTurn: Joi.boolean().required().description('turn completed or not'),
    hands: Joi.number().required().description('total hands'),
    bags: Joi.number().required().description('total bags'),
    point: Joi.number().required().description('total point'),
    isLeft: Joi.boolean().required().description('user is left'),
    isAuto: Joi.boolean().required().description('auto turn'),
    isTurn: Joi.boolean().required().description('user turn'),
    isBot: Joi.boolean().required().description('isBot yer or not'),
  })
  .allow({})
  .unknown(true);

export = playerGamePlaySchema;
