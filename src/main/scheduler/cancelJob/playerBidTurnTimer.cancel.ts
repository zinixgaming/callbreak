const Bull = require("bull");
import logger from "../../logger";
import { getConfig } from "../../../config";
import commonEventEmitter from "../../commonEventEmitter";
import { PLAYER_BID_TURN_TIMER_CANCELLED } from "../../../constants/eventEmitter";
import url from "url"

const {
  SCHEDULER_REDIS_PORT,
  REDIS_DB,
  SCHEDULER_REDIS_HOST,
  SCHEDULER_REDIS_PASSWORD,
  REDIS_CONNECTION_URL,
  NODE_ENV
} = getConfig();
const log: { host: string; port: number; password?: string; db?: number } = {
  host: SCHEDULER_REDIS_HOST,
  port: SCHEDULER_REDIS_PORT,
  db:REDIS_DB
};
if (SCHEDULER_REDIS_PASSWORD !== "") log.password = SCHEDULER_REDIS_PASSWORD;
if (REDIS_DB !== "") log.db = REDIS_DB;

let playerBidTurnTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  playerBidTurnTimerQueue = new Bull('startBidTurnTimer', {redis : {host : hostname, port:port, db : Number(REDIS_DB)} });
} else {
  playerBidTurnTimerQueue = new Bull(`startBidTurnTimer`, {
    redis: log,
  });
}

const playerBidTurnTimerCancel = async (jobId: string) => {
  try {
    const job = await playerBidTurnTimerQueue.getJob(jobId);
    logger.debug('JOB CANCELLED PLAYER BID TURN  JOB ID:" ---- ', jobId);
    logger.debug('JOB CANCELLED PLAYER BID TURN  JOB ID:" job ---- ', job);
    if (job) {
      await job.remove();
      commonEventEmitter.emit(PLAYER_BID_TURN_TIMER_CANCELLED, jobId);
    }
  } catch (e) {
    logger.error("CATCH_ERROR : playerBidTurnTimerCancel--:", jobId, e);
  }
};

export = playerBidTurnTimerCancel;
