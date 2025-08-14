const Bull = require("bull");
import logger from "../../logger";
import { winnerDeclareTimerProcess } from "../processes";
import { getConfig } from "../../../config";
import { winnerDeclareTimerIf } from "../../interface/schedulerIf";
import Validator from "../../Validator";
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
  tableSnapshotQueue = new Bull('winnerDeclareTimer', {redis : {host : hostname, port:port, db : Number(REDIS_DB)} });
}else{
  tableSnapshotQueue = new Bull(`winnerDeclareTimer`, {
    redis: log,
  });
}


const winnerDeclareTimer = async (data: winnerDeclareTimerIf) => {
  try {
    data = await Validator.schedulerValidator.winnerDeclareTimerValidator(data);
    const options = {
      delay: data.timer, // in ms
      jobId: data.tableId,
      removeOnComplete: true,
    };

    logger.info(data.tableId,"-- ");
    logger.info(data.tableId, options, "winnerDeclareTimer ------ ");
    logger.info(data.tableId,"-- ");

    await tableSnapshotQueue.add(data, options);
  } catch (error) {
    logger.error(data.tableId,"CATCH_ERROR : winnerDeclareTimer :: ", data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
  }
};

tableSnapshotQueue.process(winnerDeclareTimerProcess);

export = winnerDeclareTimer;
