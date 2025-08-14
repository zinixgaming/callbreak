import logger from "../../../logger";
import Scheduler from "../../../scheduler";
import { formatStartUserTurn } from "../playHelper";
import {
  EVENTS,
  // MAX_TIMEOUT,
  NUMERICAL,
  TABLE_STATE,
} from "../../../../constants";
import CommonEventEmitter from "../../../commonEventEmitter";
import {
  getRoundTableData,
  setRoundTableData,
  getTurnHistory,
} from "../../../gameTable/utils";
import { playerPlayingDataIf } from "../../../interface/playerPlayingTableIf";
import { playingTableIf } from "../../../interface/playingTableIf";
import { roundTableIf } from "../../../interface/roundTableIf";
import cancelBattle from "../../cancelBattle";
import Errors from "../../../errors";

// manage Player Turn Timer
async function startUserTurn(
  tableData: playingTableIf,
  playerGamePlays: playerPlayingDataIf[],
  nextTurn: string
): Promise<boolean>{
  const { _id: tableId, isFTUE } = tableData;
  const { getLock } = global;
  const startUserTurnLock = await getLock.acquire([tableId], 2000);
  try {
    if (playerGamePlays.length <= 1)
      throw new Error('startUserTurn:: Error: "playingTableData not found!!!"');
    const playerGamePlay = playerGamePlays.filter(
      (e: playerPlayingDataIf) => e.userId === nextTurn
    )[0];

    const resolvedPromise = await Promise.all([
      getRoundTableData(tableId, tableData.currentRound),
      getTurnHistory(tableId, tableData.currentRound),
    ]);
    logger.info(tableId, "get table data: " + JSON.stringify(resolvedPromise[0]));
    
    const tableGameData: roundTableIf = resolvedPromise[0];
    
    if(tableGameData.tableState == TABLE_STATE.SCOREBOARD_DECLARED) return false;
    const turnHistory = resolvedPromise[1] || {};

    tableGameData.currentTurn = playerGamePlay.userId;
    tableGameData.currentPlayerInTable = tableGameData.seats.length;
    tableGameData.turnCount = turnHistory.turnsDetails.length + 1;
    tableGameData.tableCurrentTimer = Number(new Date());
    tableGameData.tableState = TABLE_STATE.ROUND_STARTED;

    await Promise.all([
      setRoundTableData(tableId, tableData.currentRound, tableGameData),
    ]);

    const eventUserTurnData = await formatStartUserTurn(
      playerGamePlay,
      tableData,
      tableGameData
    );

    // send User Turn Started Socket Event
    CommonEventEmitter.emit(EVENTS.USER_TURN_STARTED_SOCKET_EVENT, {
      tableId: tableId.toString(),
      data: eventUserTurnData,
    });

    /**
     * need to restart turn timer sechduler
     */
    logger.info(tableId, "startUserTurn : turn timer started ");
    if (isFTUE && playerGamePlay.seatIndex !== NUMERICAL.ZERO) {
      logger.info(tableId, 
        "startUserTurn : FTUE Turn : playerGamePlay.seatIndex :",
        playerGamePlay.seatIndex
      );
      // Schedul Robot Turn Timer start 1 sec for FTUE
      await Scheduler.addJob.playerTurnTimer({
        timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
        jobId: `${playerGamePlay.userId}:${tableId}:${tableData.currentRound}`,
        playerGamePlay,
        tableData,
      });
    } else if (
      isFTUE &&
      playerGamePlay.seatIndex === NUMERICAL.ZERO &&
      tableGameData.turnCount > NUMERICAL.TWELVE
    ) {
      logger.info(tableId, 
        "startUserTurn : FTUE Turn : playerGamePlay.seatIndex :",
        playerGamePlay.seatIndex
      );
      // Schedul Player Turn Timer start for FTUE
      await Scheduler.addJob.playerTurnTimer({
        timer: (tableData.userTurnTimer + NUMERICAL.ONE) * NUMERICAL.THOUSAND,
        jobId: `${playerGamePlay.userId}:${tableId}:${tableData.currentRound}`,
        playerGamePlay,
        tableData,
      });
    } else if (!isFTUE) {
      if (playerGamePlay.isBot) {
        logger.info(tableId, 'startUserTurn :: bot turn timer schedul ::');
        // Schedul for Bot Turn Time for 5 sec
        await Scheduler.addJob.botTurnTimer({
          timer: NUMERICAL.ONE * NUMERICAL.FIVE_HUNDRED,
          jobId: `${playerGamePlay.userId}:${tableId}:${tableData.currentRound}`,
          playerGamePlay,
          tableData,
        });
      } else if (playerGamePlay.isAuto) {
        logger.info(tableId, "startUserTurn : Auto Turn ");
        // Schedul Player Auto Turn Timer start 4 sec
        await Scheduler.addJob.playerTurnTimer({
          timer: NUMERICAL.TWO * NUMERICAL.THOUSAND,
          jobId: `${playerGamePlay.userId}:${tableId}:${tableData.currentRound}`,
          playerGamePlay,
          tableData,
          isAutoMode:true
        });
      } else {
        // Schedul Player Turn Timer start
        logger.info(tableId, "startUserTurn : Manual Turn ");
        await Scheduler.addJob.playerTurnTimer({
          timer: (tableData.userTurnTimer + NUMERICAL.ONE) * NUMERICAL.THOUSAND,
          jobId: `${playerGamePlay.userId}:${tableId}:${tableData.currentRound}`,
          playerGamePlay,
          tableData,
          isAutoMode:false
        });
      }
    }
    return true;
  } catch (e) {
    logger.error(tableId, 
      `CATCH_ERROR : startUserTurn : tableId: ${tableId} :: userId: ${nextTurn} :: `,
      e
    );
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
    return false;
  } finally {
    await getLock.release(startUserTurnLock);
  }
};
export = startUserTurn;
