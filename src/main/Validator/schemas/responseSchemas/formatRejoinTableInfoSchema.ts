import {playerGamePlaySchema} from '../methodSchemas';
import Joi from 'joi';

const formatRejoinTableInfoSchema = Joi.object().keys({
  isRejoin: Joi.boolean().required().description('Rejoin Data'),
  bootValue: Joi.string().required().description('boot value'),
  userTurnTimer: Joi.number().required().description('user Turn Timer'),
  potValue: Joi.number().required().description('pot boot value'),
  winningScores: Joi.array()
    .items(Joi.number())
    .required()
    .description('winning Scores'),
  seatIndex: Joi.number().required().description('seat Index'),
  roundTableId: Joi.string().required().description('table Id'),
  tableId: Joi.string().required().description('table Id'),
  tableState: Joi.string().required().description('table status'),
  totalPlayers: Joi.number().required().description('total Player'),
  totalRound: Joi.number().required().description('total Round'),
  currentRound: Joi.number().required().description('current Round'),
  winnningAmonut: Joi.number().required().description('winnning Amonut'),
  noOfPlayer: Joi.number().required().description('total max Player'),
  turnCurrentCards: Joi.array()
    .items(Joi.string())
    .required()
    .description('current turn card'),
  turnCardSequence: Joi.string()
    .required()
    .description('current turn card sequence'),
  breakingSpades: Joi.boolean().required().description('breaking spades '),
  currentTurn: Joi.number().required().description('user Seat Index'),
  dealerPlayer: Joi.number().required().description('dealer Seat Index'),
  isBidTurn: Joi.boolean().required().description('bid turn finish or not'),
  currentTurnTimer: Joi.number().required().description('current turn timer'),
  userBalance: Joi.number().required().description('user Balance '),
  remaningRoundTimer: Joi.number()
    .required()
    .description('remaning Round Timer '),
  playarDetail: Joi.array().items(playerGamePlaySchema).allow({}),
  massage: Joi.string().required().allow('').description('massage'),
});

export = formatRejoinTableInfoSchema;
