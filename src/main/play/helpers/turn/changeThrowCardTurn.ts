import cancelBattle from '../../cancelBattle';
import {getNextPlayer} from '../../../common';
import {
  getTableData,
  getRoundTableData,
  getPlayerGamePlay,
  setPlayerGamePlay,
} from '../../../gameTable/utils';
import logger from '../../../logger';
import {NUMERICAL} from '../../../../constants';
import Scheduler from '../../../scheduler';
import {playerPlayingDataIf} from '../../../interface/playerPlayingTableIf';
import {playingTableIf} from '../../../interface/playingTableIf';
import {roundTableIf} from '../../../interface/roundTableIf';
import Errors from '../../../errors';

// change User Throw Card Turn
const changeThrowCardTurn = async (tableId: string) => {
  logger.debug(
    tableId,
    'changeThrowCardTurn : started with tableId :: ',
    tableId,
  );
  const {getLock} = global;
  const changeThrowCardTurnLock = await getLock.acquire([tableId], 2000);
  try {
    const playingTable: playingTableIf = await getTableData(tableId);
    const {currentRound, isFTUE} = playingTable;
    const tableGamePlay: roundTableIf = await getRoundTableData(
      tableId,
      currentRound,
    );
    const lastTurnPlayerData: playerPlayingDataIf = await getPlayerGamePlay(
      tableGamePlay.currentTurn,
      tableId,
    );
    lastTurnPlayerData.isTurn = false;
    await setPlayerGamePlay(
      tableGamePlay.currentTurn,
      tableId,
      lastTurnPlayerData,
    );
    const playersGameData: playerPlayingDataIf[] = await Promise.all(
      Object.keys(tableGamePlay.seats).map(async ele =>
        getPlayerGamePlay(tableGamePlay.seats[ele].userId, tableId),
      ),
    );

    logger.info(
      tableId,
      'changeThrowCardTurn : playersGameData :: ',
      playersGameData,
    );

    const nextTurn: string = await getNextPlayer(
      tableGamePlay.seats,
      tableGamePlay.currentTurn,
    );

    // match fist Initiater and Last Initiater are Not equal then declare winnwer of turn and change User Turn
    if (tableGamePlay.lastInitiater !== nextTurn) {
      const playerGamePlay: playerPlayingDataIf = await getPlayerGamePlay(
        nextTurn,
        tableId,
      );
      playerGamePlay.isTurn = true;
      await setPlayerGamePlay(nextTurn, tableId, playerGamePlay);

      // const playerGamePlays = [playerGamePlay];
      // for (let i = NUMERICAL.ZERO; i < tableGamePlay.seats.length; i++) {
      //   const ele = tableGamePlay.seats[i];
      //   if (ele._id !== nextTurn)
      //     playerGamePlays.push({
      //       nextTurn,
      //       seatIndex: ele.seat,
      //     });
      // }
      logger.info(
        tableId,
        'changeThrowCardTurn : userId :: ',
        playerGamePlay.userId,
        'playerGamePlay :: ',
        playerGamePlay,
        ' : nextTurn :1: ',
        nextTurn,
        ' : nextTurn :2: ',
        tableGamePlay.lastInitiater,
      );

      // Schedule Turn Setup Timer
      await Scheduler.addJob.initialTurnSetupTimer({
        timer: NUMERICAL.ZERO * NUMERICAL.FIVE_HUNDRED, // change 2 to 1
        jobId: `${tableId}:${playingTable.currentRound}`,
        tableData: playingTable,
        playerGamePlayData: playersGameData,
        nextTurn,
      });
      /*
       * in FTUE playing push declear winner of round
       * if isFTUE is false or turnCount is greater than 12
       */
    } else if (!isFTUE || tableGamePlay.turnCount > NUMERICAL.TWELVE) {
      /*
       * Initiater Match to Call Winner Declare of Round
       */
      await Scheduler.addJob.winOfRoundSetupTimer({
        timer: NUMERICAL.ONE * NUMERICAL.THOUSAND, // change 2 to 1
        jobId: `${tableId}:${playingTable.currentRound}`,
        tableId,
      });
    }
  } catch (e) {
    logger.error(
      tableId,
      `CATCH_ERROR : changeThrowCardTurn : tableId: ${tableId} :: `,
      e,
    );
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    await getLock.release(changeThrowCardTurnLock);
  }
};

export = changeThrowCardTurn;
