const redis = require("redis");
const Redlock = require("redlock");
import { logger, Redis } from "../main";
import { getConfig } from "../config";
import url from "url"

let connectionsMap: any = null;

const connectionCallback = async () =>
  new Promise((resolve, reject) => {
    const {
      REDIS_HOST,
      REDIS_PASSWORD,
      REDIS_PORT,
      PUBSUB_REDIS_HOST,
      PUBSUB_REDIS_PORT,
      PUBSUB_REDIS_PASSWORD,
      REDIS_DB,
      REDIS_CONNECTION_URL,
      NODE_ENV
    } = getConfig();

    let counter = 0;
    const redisConfig: {
      host: string;
      port: number;
      password?: string;
    } = {
      host: REDIS_HOST,
      port: REDIS_PORT,
    };

    const pubSubRedisConfig: {
      host: string;
      port: number;
      password?: string;
    } = {
      host: PUBSUB_REDIS_HOST,
      port: PUBSUB_REDIS_PORT,
    };

    if (REDIS_PASSWORD !== "") redisConfig.password = REDIS_PASSWORD;
    if (PUBSUB_REDIS_PASSWORD !== "")
      pubSubRedisConfig.password = PUBSUB_REDIS_PASSWORD;

    console.log("redis data :: ", redisConfig, "NODE_ENV  :>>" , NODE_ENV);

    let client: any;
    let pubClient: any;
    if (NODE_ENV === "PRODUCTION") {
      console.log('PRODUCTION :: REDIS_CONNECTION_URL ::>> ', REDIS_CONNECTION_URL);

      const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
      client = redis.createClient({ host : hostname, port : port, db : Number(REDIS_DB) });
      pubClient = redis.createClient({ host : hostname, port : port, db : Number(REDIS_DB) });
      

    } else {
      client = redis.createClient(redisConfig);
      pubClient = redis.createClient(pubSubRedisConfig);
      if (REDIS_DB !== "") {
        client.select(REDIS_DB);
        pubClient.select(REDIS_DB);
      }
    }

    const subClient = pubClient.duplicate();

    function check() {
      if (counter === 2) {
        connectionsMap = { client, pubClient, subClient };
        resolve(connectionsMap);
      }
    }

    client.flushdb(function (err: any, succeeded: any) {
      logger.info("FLUSH-DB ===>>", succeeded); 
    });

    client.on("ready", () => {
      logger.info("Redis connected successfully.");
      Redis.init(client);
      counter += 1;
      check();
    });

    client.on("error", (error: any) => {
      logger.error("CATCH_ERROR : Redis Client error:", error);
      reject(error);
    });

    pubClient.on("ready", () => {
      logger.info("pubClient connected successfully.");
      counter += 1;
      check();
    });

    pubClient.on("error", (error: any) => {
      logger.error("CATCH_ERROR : pubClient Client error:", error);
      reject(error);
    });
  });

let redlock: any = null;

function registerRedlockError() {
  redlock.on("CATCH_ERROR : RedLock : error", logger.error);
}

function initializeRedlock(redisClient: any) {
  if (redlock) return redlock;

  redlock = new Redlock([redisClient], {
    // The expected clock drift; for more details see:
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time
    // ∞ retries
    retryCount: -1,
    // the time in ms between attempts
    retryDelay: 25, // time in ms
    // the max time in ms randomly added to retries
    // to improve performance under high contention
    retryJitter: 20, // time in ms
    // The minimum remaining time on a lock before an extension is automatically
    // attempted with the using API.
    automaticExtensionThreshold: 500, // time in ms
  });

  registerRedlockError();
  return redlock;
}

const init = async () => connectionsMap || connectionCallback();

export = { init, initRedlock: initializeRedlock, getLock: () => redlock };
