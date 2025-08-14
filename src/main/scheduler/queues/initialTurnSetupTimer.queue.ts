const Bull = require("bull");
import logger from "../../logger";
import { initialTurnSetupTimerProcess } from "../processes";
import { getConfig } from "../../../config";
import Validator from "../../Validator";
import { initialTurnSetupTimerIf } from "../../interface/schedulerIf";
import Errors from "../../errors";
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

let tableSnapshotQueue : any;
if (NODE_ENV === "PRODUCTION") {
  const { port, hostname, auth } = url.parse(REDIS_CONNECTION_URL);
  tableSnapshotQueue = new Bull('turnSetupTimer', {redis : {host : hostname, port:port, db : Number(REDIS_DB)} });
 }else{
  tableSnapshotQueue = new Bull(`turnSetupTimer`, {
    redis: log,
  });
}

const initialTurnSetupTimer = async (data: initialTurnSetupTimerIf) => {
  try {
    data = await Validator.schedulerValidator.initialTurnSetupTimerValidator(
      data
    );
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    logger.info("-- ");
    logger.info(options, "initialTurnSetupTimer ------ ");
    logger.info("-- ");

    await tableSnapshotQueue.add(data, options);
  } catch (error) {
    logger.error("CATCH_ERROR : initialTurnSetupTimer :: ", data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
  }
};

tableSnapshotQueue.process(initialTurnSetupTimerProcess);

export = initialTurnSetupTimer;
