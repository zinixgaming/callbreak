const SocketIO = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
import os from 'os';
import server from './http';
import { SOCKET, MESSAGES, NUMERICAL, REDIS } from '../constants';
import { logger, requestHandler } from '../main';
import redis from './redis';
import userDisconnect from '../main/signUp/userDisconnect';
import { verifyUserProfile } from '../main/clientsideapi';
import { decrCounter, getOnliPlayerCount, incrCounter, setCounterIntialValue } from '../main/gameTable/utils';

let socketClient: any = null;

async function connectionCB(client: any) {
  logger.info(MESSAGES.SOCKET.INTERNAL.NEW_CONNECTION, client.id);

  const token = client.handshake.auth.token;
  const userId = client.handshake.auth.userId; // remove
  logger.info('connectionCB token :: ', token);
  logger.info('connectionCB userId :: ', userId);
  client.authToken = token;

  let getOnlinePlayerCount = await getOnliPlayerCount(REDIS.ONLINEPLAYER);
  logger.info("get OnlinePlayer Count :: ", getOnlinePlayerCount);

  if (!getOnlinePlayerCount) {
    const counterIntialValue = await setCounterIntialValue(REDIS.ONLINEPLAYER);
  }
  // for all online users 
  let count = await incrCounter(REDIS.ONLINEPLAYER)
  logger.info('insertNewPlayer :: count :: ', count);

  // client.conn is default menthod for ping pong request
  client.conn.on(SOCKET.PACKET, (packet: any) => {
    if (packet.type === 'ping') {}
  });

  /**
   * error event handler
   */
  client.on(SOCKET.ERROR, (error: any) =>
    logger.error('CATCH_ERROR : Socket : client error......,', error),
  );

  /**
   * Check auth token is valid or not 
   */
  // if(isValidUser == false ) {
  //   await decrCounter(REDIS.ONLINEPLAYER);
  //   client.disconnect();
  // }

  /**
   * disconnect request handler
   */
  client.on(SOCKET.DISCONNECT, async () => {
    await decrCounter(REDIS.ONLINEPLAYER);
    userDisconnect(client);
  });

  /**
   * bind requestHandler
   */

  client.use(requestHandler.bind(client));
}

const createSocketServer = async () => {
  const { pubClient, subClient } = await redis.init();

  if (!socketClient) {
    const socketConfig = {
      transports: [SOCKET.WEBSOCKET, SOCKET.POLLING],
      pingInterval: NUMERICAL.THOUSAND, // to send ping/pong events for specific interval (milliseconds)
      pingTimeout: NUMERICAL.TEN_THOUSAND, // if ping is not received in the "pingInterval" seconds then milliseconds will be disconnected in "pingTimeout" milliseconds
      allowEIO3: true,
    };

    socketClient = SocketIO(server, socketConfig);

    socketClient.adapter(createAdapter(pubClient, subClient));

    socketClient.on(SOCKET.CONNECTION, connectionCB);
  }

  return socketClient;
};
const getSocketClient = () => socketClient;
const exportObject = {
  createSocketServer,
  // logging,
  getSocketClient,
};

export = exportObject;
