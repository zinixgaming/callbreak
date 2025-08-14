import Redlock from 'redlock';
import {createClient} from 'redis';
import {logger, Redis} from '../main';
import {getConfig} from '../config';

let connectionsMap: any = null;
let redlock: Redlock | null = null;

const connectionCallback = async () => {
  const {
    REDIS_HOST,
    REDIS_PASSWORD,
    REDIS_PORT,
    PUBSUB_REDIS_HOST,
    PUBSUB_REDIS_PORT,
    PUBSUB_REDIS_PASSWORD,
    REDIS_DB,
    REDIS_CONNECTION_URL,
    NODE_ENV,
  } = getConfig();

  const redisConfig = {
    socket: {
      host: REDIS_HOST,
      port: Number(REDIS_PORT),
    },
    password: REDIS_PASSWORD || undefined,
    database: REDIS_DB ? Number(REDIS_DB) : undefined,
  };

  const pubSubRedisConfig = {
    socket: {
      host: PUBSUB_REDIS_HOST,
      port: Number(PUBSUB_REDIS_PORT),
    },
    password: PUBSUB_REDIS_PASSWORD || undefined,
    database: REDIS_DB ? Number(REDIS_DB) : undefined,
  };

  let client;
  let pubClient;

  if (NODE_ENV === 'PRODUCTION' && REDIS_CONNECTION_URL) {
    logger.info(
      'PRODUCTION :: REDIS_CONNECTION_URL ::>> ',
      REDIS_CONNECTION_URL,
    );

    const parsedUrl = new URL(REDIS_CONNECTION_URL);
    client = createClient({
      socket: {
        host: parsedUrl.hostname,
        port: Number(parsedUrl.port),
      },
      password: parsedUrl.password || undefined,
      database: REDIS_DB ? Number(REDIS_DB) : undefined,
    });

    pubClient = createClient({
      socket: {
        host: parsedUrl.hostname,
        port: Number(parsedUrl.port),
      },
      password: parsedUrl.password || undefined,
      database: REDIS_DB ? Number(REDIS_DB) : undefined,
    });
  } else {
    client = createClient(redisConfig);
    pubClient = createClient(pubSubRedisConfig);
  }

  const subClient = pubClient.duplicate();

  // Connect all clients
  await Promise.all([
    client.connect(),
    pubClient.connect(),
    subClient.connect(),
  ]);

  // Flush DB only if needed (optional)
  await client.flushDb();
  logger.info('FLUSH-DB ===>> Success');

  logger.info('Redis connected successfully.');
  Redis.init(client);

  logger.info('pubClient connected successfully.');

  connectionsMap = {client, pubClient, subClient};
  return connectionsMap;
};

function initializeRedlock(redisClient: any) {
  if (redlock) return redlock;

  redlock = new Redlock([redisClient], {
    driftFactor: 0.01,
    retryCount: -1,
    retryDelay: 25,
    retryJitter: 20,
    automaticExtensionThreshold: 500, // automatically extend locks that are within 500ms of expiring
  });
  
  redlock.on('error', err => {
    logger.error('CATCH_ERROR : RedLock :', err);
  });

  return redlock;
}

const init = async () => connectionsMap || connectionCallback();

export = {init, initRedlock: initializeRedlock, getLock: () => redlock};
