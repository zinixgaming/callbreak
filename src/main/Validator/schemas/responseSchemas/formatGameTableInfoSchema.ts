import seatsSchema from '../methodSchemas/seatsSchema';

import Joi from 'joi';

const formatGameTableInfoSchema = Joi.object().keys({
  isRejoin: Joi.boolean().required().description('Rehjoin Data'),
  bootValue: Joi.number().required().description('boot value'),
  potValue: Joi.number().required().description('pot boot value'),
  userTurnTimer: Joi.number().required().description('user Turn Timer'),
  winningScores: Joi.array()
    .items(Joi.number())
    .required()
    .description('winning Scores'),
  tableId: Joi.string().required().description('table Id'),
  roundTableId: Joi.string().required().description('table Id'),
  totalPlayers: Joi.number().required().description('total Player'),
  totalRound: Joi.number().required().description('totalRound'),
  currentRound: Joi.number().required().description('currentRound'),
  winnningAmonut: Joi.string().required().description('winnningAmonut'),
  noOfPlayer: Joi.number().required().description('total max Player'),
  seats: Joi.array().items(seatsSchema),
  isFTUE: Joi.boolean().required().description('tutorial playing flag'),
  seatIndex: Joi.number().required().description('seat Index'),
});

export = formatGameTableInfoSchema;
