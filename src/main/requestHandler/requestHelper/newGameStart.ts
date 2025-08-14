import logger from '../../logger';
import { insertNewPlayer } from '../../gameTable';
import REDIS from '../../redis';
import { PREFIX } from '../../../constants/redis';

async function newGameStartHandler(data: any, socket: any, ack?: Function) {
  const { userId } = socket.eventMetaData;
  const keyForUser = `${PREFIX.USER}:${userId}`;
  const userInfo = await REDIS.commands.getValueFromKey(keyForUser);

  return insertNewPlayer(userInfo, socket, ack).catch((e: any) =>
    logger.error(userId, e),
  );
}

export = newGameStartHandler;
