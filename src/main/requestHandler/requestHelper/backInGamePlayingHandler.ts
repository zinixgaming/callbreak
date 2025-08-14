import logger from '../../logger';
import backInGamePlaying from '../../play/rejoinTable/backInGamePlaying';

function backInGamePlayingHandler(data: any, socket: any, ack?: Function) {
  logger.info('call backInGamePlayingHandler :: ');

  return backInGamePlaying(socket, ack).catch((e: any) => logger.error(e));
}

export = backInGamePlayingHandler;
