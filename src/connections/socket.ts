import {Server as SocketIOServer} from 'socket.io';
import {createAdapter} from '@socket.io/redis-adapter';
import server from './http';
import {SOCKET, MESSAGES, NUMERICAL, REDIS} from '../constants';
import {logger, requestHandler} from '../main';
import redis from './redis';
import userDisconnect from '../main/signUp/userDisconnect';
import {
  decrCounter,
  getOnliPlayerCount,
  incrCounter,
  setCounterIntialValue,
} from '../main/gameTable/utils';

let socketClient: SocketIOServer | null = null;

async function connectionCB(client: any) {
  logger.info(MESSAGES.SOCKET.INTERNAL.NEW_CONNECTION, client.id);

  const token = client.handshake.auth.token;
  const userId = client.handshake.auth.userId;
  logger.info('connectionCB token :: ', token);
  logger.info('connectionCB userId :: ', userId);

  client.authToken = token;

  const getOnlinePlayerCount = await getOnliPlayerCount(REDIS.ONLINEPLAYER);
  logger.info('get OnlinePlayer Count :: ', getOnlinePlayerCount);

  if (!getOnlinePlayerCount) {
    await setCounterIntialValue(REDIS.ONLINEPLAYER);
  }

  const count = await incrCounter(REDIS.ONLINEPLAYER);
  logger.info('insertNewPlayer :: count :: ', count);

  client.conn.on(SOCKET.PACKET, (packet: any) => {
    if (packet.type === 'ping') {
      // Handle ping if needed
    }
  });

  client.on(SOCKET.ERROR, (error: any) => {
    logger.error('CATCH_ERROR : Socket : client error......,', error);
  });

  client.on(SOCKET.DISCONNECT, async () => {
    await decrCounter(REDIS.ONLINEPLAYER);
    userDisconnect(client);
  });

  client.use(requestHandler.bind(client));
}

async function createSocketServer(): Promise<SocketIOServer> {
  const {pubClient, subClient} = await redis.init();

  if (!socketClient) {
    const socketConfig = {
      transports: [SOCKET.WEBSOCKET, SOCKET.POLLING],
      pingInterval: NUMERICAL.THOUSAND,
      pingTimeout: NUMERICAL.TEN_THOUSAND,
      allowEIO3: true,
    };

    socketClient = new SocketIOServer(server, socketConfig);
    socketClient.adapter(createAdapter(pubClient, subClient));
    socketClient.on(SOCKET.CONNECTION, connectionCB);
  }

  return socketClient;
}

function getSocketClient(): SocketIOServer | null {
  return socketClient;
}

export default {
  createSocketServer,
  getSocketClient,
};
