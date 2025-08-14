import Bull from "bull"
import logger from "../../logger";
import { getConfig } from "../../../config";
import commonEventEmitter from "../../commonEventEmitter";
import { PLAYER_TURN_TIMER_CANCELLED } from "../../../constants/eventEmitter";
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
  db: REDIS_DB
};
if (SCHEDULER_REDIS_PASSWORD !== "") log.password = SCHEDULER_REDIS_PASSWORD;
if (REDIS_DB !== "") log.db = REDIS_DB;

let playerTurnTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  // playerTurnTimerQueue = new Bull('startTurnTimer', { redis: { host: hostname, port: port, db: Number(REDIS_DB) } });
  playerTurnTimerQueue = new Bull('startTurnTimer', REDIS_CONNECTION_URL);
  // console.log('playerTurnTimerQueue :>> ', playerTurnTimerQueue);
} else {
  playerTurnTimerQueue = new Bull(`startTurnTimer`, {
    redis: log,
  });
}

const playerTurnTimerCancel = async (jobId: string) => {
  try {
    const job = await playerTurnTimerQueue.getJob(jobId);
    logger.debug('JOB CANCELLED PLAYER TURN  JOB ID:" ---- ', jobId);
    logger.debug('JOB CANCELLED PLAYER TURN  JOB ID:" job ---- ', job);
    if (job) {
      await job.remove();
      commonEventEmitter.emit(PLAYER_TURN_TIMER_CANCELLED, jobId);
    }
  } catch (e) {
    logger.error("CATCH_ERROR : playerTurnTimerCancel", jobId, e);
  }
};

export = playerTurnTimerCancel;
