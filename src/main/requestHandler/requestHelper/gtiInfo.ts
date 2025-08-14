import logger from '../../logger';
import gameTableInfo from '../../gameTableInfo';

async function showGameTableInfoHelper( {data} : any, socket: any, ack?: Function) {
  try {
    return await gameTableInfo(data, socket, ack);
  } catch (error) {
    logger.error(socket.eventMetaData.table, 'CATCH_ERROR:  showGameTableInfoHelper :: ', error);
  }
}

export = showGameTableInfoHelper;
