import logger from '../../logger';
import {helpers} from '../../play';
import {setBidHelperRequestIf} from '../../interface/requestIf';
import Validator from '../../Validator';

async function userBidHandler(
  {data: bidData}: setBidHelperRequestIf,
  socket: any,
  ack?: (response: any) => void,
) {
  const {eventMetaData}: any = socket;
  try {
    bidData = await Validator.requestValidator.userBidValidator(bidData);
    const data = {
      bid: bidData.bid,
    };

    return helpers
      .bidTurn(data, socket, ack)
      .catch((e: any) => logger.error(e));
  } catch (error) {
    logger.error(
      eventMetaData.tableId,
      `CATCH_ERROR : userBidHandler :: userId: ${eventMetaData.userId} :: tableId: ${eventMetaData.tableId} :: `,
      bidData,
      error,
    );
  }
}

export = userBidHandler;
