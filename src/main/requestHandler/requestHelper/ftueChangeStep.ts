import socketAck from '../../../socketAck';
import { EVENTS, FTUE_STEP, NUMERICAL } from '../../../constants';
import logger from '../../logger';
import { startBidTurn, startManuallyTurn } from '../../FTUE/play';
import Scheduler from '../../scheduler';

async function ftueChangeStep(data: any, socket: any, ack: any) {
  const { step } = data.data;
  const { tableId, currentRound } = socket.eventMetaData;
  logger.info(tableId, 'ftueChangeStep : data ::', data.data);
  logger.info(tableId,'ftueChangeStep : data ::', step);
  logger.info(tableId,'ftueChangeStep : data ::', typeof step);
  logger.info(tableId,'ftueChangeStep : data ::', NUMERICAL.SEVEN);
  logger.info(tableId,'ftueChangeStep : data ::', typeof NUMERICAL.SEVEN);

  switch (step) {
    case FTUE_STEP.START_BID_TURN:
      await startBidTurn(socket);
      break;

    case FTUE_STEP.DECLARE_ROUND_TURN_WINNER:
      /*
       * Initiater Step to Call Winner Declare of Round
       */
      await Scheduler.addJob.winOfRoundSetupTimer({
        timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${currentRound}`,
        tableId,
      });
      break;

    case FTUE_STEP.START_MANUALLY_TURN:
      await startManuallyTurn(socket);
      break;

    default:
      logger.info(tableId,'ftueChangeStep call in switch :: default');
      break;
  }

  logger.info(tableId,'ftueMessage :: response :', data);
  socketAck.ackMid(
    EVENTS.FTUE_CHANGE_STEP_SOCKET_EVENT,
    data,
    // socket.metrics,
    socket.userId,
    socket.eventMetaData.tableId,
    ack,
  );
}

export = ftueChangeStep;
