const Joi = require('joi');

const formatShowScoreBoardSchema = Joi.array()
  .items(
    Joi.object().keys({
      title: Joi.string().required().description('round tital'),
      winner: Joi.array()
        .items(Joi.number())
        .required()
        .description('user seat index'),
      roundScore: Joi.array().items(
        Joi.object().keys({
          username: Joi.string().required().allow('').description('user name'),
          profilePicture: Joi.string()
            .required()
            .allow('')
            .description('user profile pic'),
          seatIndex: Joi.number().required().description('seat index'),
          userId: Joi.number().required().description('user unique id'),
          bid: Joi.number().required().description('user set bid'),
          hands: Joi.number().required().description('total hands'),
          isLeft: Joi.boolean().required().description('user is left'),
          roundBags: Joi.number().required().description('total round bags'),
          roundPoint: Joi.number().required().description('total round point'),
          totalBags: Joi.number().required().description('total bags'),
          BagsPenalty: Joi.number()
            .required()
            .description('total round bags Penalty'),
          totalPoint: Joi.number().required().description('total point'),
        }),
      ),
    }),
  )
  .required()
  .description('score data');

export = formatShowScoreBoardSchema;
