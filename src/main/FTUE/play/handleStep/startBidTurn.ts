import { NUMERICAL } from "../../../../constants";
import Scheduler from "../../../scheduler";
import {
  getPlayerGamePlay,
  getTableData,
  getRoundTableData,
} from "../../../gameTable/utils";
import { playerPlayingDataIf } from "../../../interface/playerPlayingTableIf";
import logger from "../../../logger";

const startBidTurn = async (socket: any) => {
  logger.info("startBidTurn :: call ::");
  const { tableId } = socket.eventMetaData;
  logger.info("startBidTurn :: call :: tableId", tableId);

  const tableData = await getTableData(tableId);
  logger.info("startBidTurn :: call :: tableData", tableData);
  const { currentRound } = tableData;
  const roundData = await getRoundTableData(tableId, currentRound);
  logger.info("startBidTurn :: call :: roundData", roundData);

  const { userId } = roundData.seats.s1;

  const playerGamePlayData: playerPlayingDataIf[] = await Promise.all(
    Object.keys(roundData.seats).map(
      async (key) =>
        await getPlayerGamePlay(roundData.seats[key].userId, tableId)
    )
  );
  logger.info("startBidTurn :: call :: playerGamePlayData", playerGamePlayData);
  /* 
        scheduling 2 sec timer for start bid Turn 
    */
  await Scheduler.addJob.initialBidTurnSetupTimer({
    timer: NUMERICAL.ZERO * NUMERICAL.THOUSAND,
    jobId: `${tableId}:${currentRound}`,
    tableData,
    playerGamePlayData,
    nextTurn: userId ? userId : "",
  });

  return true;
};
export = startBidTurn;
