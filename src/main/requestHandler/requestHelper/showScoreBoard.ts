import logger from '../../logger';
import {helpers} from '../../play';
import {showUserScoreHelperIf} from '../../interface/userScoreIf';
import Validator from '../../Validator';

async function showScoreBoardHandler(
  {data}: showUserScoreHelperIf,
  socket: any,
  ack?: (response: any) => void,
) {
  const {eventMetaData}: any = socket;
  try {
    data = await Validator.requestValidator.showScoreValidator(data);
    return helpers
      .showScoreBoard(data, socket, ack)
      .catch((e: any) => logger.error(e));
  } catch (error) {
    logger.error(
      eventMetaData.tableId,
      `CATCH_ERROR : showScoreBoardHandler :: userId: ${eventMetaData.userId} :: tableId: ${eventMetaData.tableId} :: `,
      data,
      error,
    );
    return error;
  }
}

export = showScoreBoardHandler;
