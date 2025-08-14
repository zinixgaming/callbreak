import logger from "../../../../logger";
import { getNextPlayer } from "../../../../common";
import {
  getTableData,
  getRoundTableData,
  setRoundTableData,
  getPlayerGamePlay,
  setPlayerGamePlay,
} from "../../../../gameTable/utils";
import { NUMERICAL, TABLE_STATE } from "../../../../../constants";
import Scheduler from "../../../../scheduler";
import { playingTableIf } from "../../../../interface/playingTableIf";
import { roundTableIf } from "../../../../interface/roundTableIf";
import { playerPlayingDataIf } from "../../../../interface/playerPlayingTableIf";
import cancelBattle from "../../../cancelBattle";
import Errors from "../../../../errors";

// Change User Bid Turn
const changeTurn = async (tableId: string) => {
  const { getLock } = global;
  const changeTurnLock = await getLock.acquire([tableId], 2000);
  try {
    logger.debug(tableId, "changeTurn : started with tableId :: ", tableId);
    const playTable: playingTableIf = await getTableData(tableId);
    const { currentRound } = playTable;
    const tableGamePlay: roundTableIf = await getRoundTableData(
      tableId,
      currentRound
    );

    if(tableGamePlay.tableState == TABLE_STATE.SCOREBOARD_DECLARED) return false;

    const playersGameData: playerPlayingDataIf[] = await Promise.all(
      Object.keys(tableGamePlay.seats).map(async (ele) =>
        getPlayerGamePlay(tableGamePlay.seats[ele].userId, tableId)
      )
    );

    // get Player Object Id Of Next Turn
    const nextTurn: string = await getNextPlayer(
      tableGamePlay.seats,
      tableGamePlay.currentTurn
    );

    // next turn player Details
    const playerGamePlay: playerPlayingDataIf = await getPlayerGamePlay(
      nextTurn,
      tableId
    );

    let bidTurnComplete = false;
    if (playerGamePlay.bidTurn) {
      bidTurnComplete = true;
    }

    // Bid Turn is Complete
    if (bidTurnComplete) {
      tableGamePlay.lastInitiater = nextTurn;
      tableGamePlay.tableState = TABLE_STATE.ROUND_STARTED;
      const nextTurnPlayerData: playerPlayingDataIf = await getPlayerGamePlay(
        nextTurn,
        tableId
      );
      nextTurnPlayerData.isTurn = true;
      await setPlayerGamePlay(nextTurn, tableId, nextTurnPlayerData);
      await setRoundTableData(tableId, currentRound, tableGamePlay);

      // set Scheduler of Card throw Turn Start
      await Scheduler.addJob.initialTurnSetupTimer({
        timer: NUMERICAL.ZERO * NUMERICAL.FIVE_HUNDRED,
        jobId: `${tableId}:${playTable.currentRound}`,
        tableData: playTable,
        playerGamePlayData: playersGameData,
        nextTurn,
      });
    } else {
      // set Scheduler of Bid Turn Start
      await Scheduler.addJob.initialBidTurnSetupTimer({
        timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${playTable.currentRound}`,
        tableData: playTable,
        playerGamePlayData: playersGameData,
        nextTurn,
      });
    }
    return true;
  } catch (e) {
    logger.error(tableId, `CATCH_ERROR : changeTurn : tableId: ${tableId} :: `, e);
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
    return false;
  } finally {
    await getLock.release(changeTurnLock);
  }
};

export = changeTurn;
