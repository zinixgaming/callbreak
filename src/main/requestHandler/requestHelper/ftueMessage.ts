import socketAck from '../../../socketAck';
import { EVENTS, MESSAGES } from '../../../constants';
import logger from '../../logger';

function ftueMessage(data: any, socket: any, ack: any) {
  const { getConfigData: config } = global;

  logger.info('ftueMessage :: MESSAGES.FTUE : ', MESSAGES.FTUE);
  const response = {
    bootAmount: 1,
    winningScores: config.WINNING_SCORES ? config.WINNING_SCORES : [-100, 50],
    potValue: 4,
    message: /*config.FTUE.MESSAGE ? config.FTUE.MESSAGE :*/ MESSAGES.FTUE,
  };

  logger.info('ftueMessage :: response :', response);
  socketAck.ackMid(
    EVENTS.FTUE_MESSAGE_SOCKET_EVENT,
    response,
    // socket.metrics,
    socket.userId,
    '',
    ack,
  );
}

export = ftueMessage;
