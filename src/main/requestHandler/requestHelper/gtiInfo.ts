import logger from '../../logger';
import gameTableInfo from '../../gameTableInfo';

async function showGameTableInfoHelper(
  {data}: any,
  socket: any,
  ack?: (response: any) => void,
) {
  try {
    return await gameTableInfo(data, socket, ack);
  } catch (error) {
    logger.error(
      socket.eventMetaData.table,
      'CATCH_ERROR:  showGameTableInfoHelper :: ',
      error,
    );
  }
}

export = showGameTableInfoHelper;
