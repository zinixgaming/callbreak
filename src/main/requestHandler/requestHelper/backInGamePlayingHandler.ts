import logger from '../../logger';
import backInGamePlaying from '../../play/rejoinTable/backInGamePlaying';

function backInGamePlayingHandler(
  data: any,
  socket: any,
  ack?: (response: any) => void,
) {
  logger.info('call backInGamePlayingHandler :: ');

  return backInGamePlaying(socket, ack).catch((e: any) => logger.error(e));
}

export = backInGamePlayingHandler;
