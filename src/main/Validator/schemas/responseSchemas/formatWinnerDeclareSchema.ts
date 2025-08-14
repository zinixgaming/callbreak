const Joi = require('joi');

const formatWinnerDeclareSchema = Joi.object().keys({
  timer: Joi.number().optional().description('turn timer'),
  roundScoreHistory:
    // Joi.array()
    // .items(
    Joi.object()
      .keys({
        total: Joi.array().items(
          Joi.object().keys({
            seatIndex: Joi.number().required().description('seat index'),
            totalPoint: Joi.number().required().description('total point'),
          }),
        ),

        scores: Joi.array().items(
          Joi.object().keys({
            title: Joi.string().required().description('round tital'),
            score: Joi.array().items(
              Joi.object().keys({
                seatIndex: Joi.number().required().description('seat index'),
                roundPoint: Joi.number()
                  .required()
                  .description('total round point'),
              }),
            ),
          }),
        ),
        users: Joi.array().items(
          Joi.object().keys({
            seatIndex: Joi.number().required().description('seat index'),
            username: Joi.string()
              .required()
              .allow('')
              .description('user name'),
            profilePicture: Joi.string()
              .required()
              .allow('')
              .description('user profile pic'),
            userStatus : Joi.string()
            .required()
            .description('user status'),
          }),
        ),
        // roundScore: Joi.array().items(
        //   Joi.object().keys({
        //     username: Joi.string()
        //       .required()
        //       .allow('')
        //       .description('user name'),
        //     profilePicture: Joi.string()
        //       .required()
        //       .allow('')
        //       .description('user profile pic'),
        //     seatIndex: Joi.number().required().description('seat index'),
        //     userId: Joi.number().required().description('user unique id'),
        //     bid: Joi.number().required().description('user set bid'),
        //     hands: Joi.number().required().description('total hands'),
        //     isLeft: Joi.boolean().required().description('user is left'),
        //     roundBags: Joi.number().required().description('total round bags'),
        //     roundPoint: Joi.number()
        //       .required()
        //       .description('total round point'),
        //     totalBags: Joi.number().required().description('total bags'),
        //     BagsPenalty: Joi.number()
        //       .required()
        //       .description('total round bags Penalty'),
        //     totalPoint: Joi.number().required().description('total point'),
        //   }),
        // ),
      })
      // )
      .required()
      .description('score data'),
  roundTableId: Joi.string().required().description('round table id'),
  winningAmount: Joi.array().items(
    Joi.object().keys({
      seatIndex: Joi.number().required().description('user seat index'),
      userId: Joi.string().required().description('userId'),
      winningAmount: Joi.string().required().description('user winning Amount')
    })
  ),
  winner: Joi.array()
    .items(Joi.number().optional())
    .optional()
    .description('user seat index'),
  nextRound : Joi.number().required().description('next Round')
});

export = formatWinnerDeclareSchema;
