import logger from '../../logger';
import { helpers } from '../../play';
import { cardThrowHelperRequestIf } from '../../interface/requestIf';
import Validator from '../../Validator';

async function throwCardHandler(
  { data: cardData }: cardThrowHelperRequestIf,
  socket: any,
  ack?: Function,
) {
  const { eventMetaData }: any = socket;
  try {
    logger.info(eventMetaData.tableId, 'call throwCardHandler : cardData :: ', cardData);

    cardData = await Validator.requestValidator.throwCardValidator(cardData);
    const data = {
      card: cardData.card,
    };

    return helpers
      .cardThrow(data, socket, ack)
      .catch((e: any) => logger.error(e));
  } catch (error) {
    logger.error(eventMetaData.tableId, 
      `CATCH_ERROR : throwCardHandler :: userId: ${eventMetaData.userId} :: tableId: ${eventMetaData.tableId} :: `,
      cardData,
      error,
    );
  }
}

export = throwCardHandler;
