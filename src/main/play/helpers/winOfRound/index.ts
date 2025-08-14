import logger from '../../../logger';
import {
  getTableData,
  getRoundTableData,
  setRoundTableData,
  getPlayerGamePlay,
  setPlayerGamePlay,
} from '../../../gameTable/utils';
import {
  NUMERICAL,
  EVENTS,
  CARD_SEQUENCE,
  EVENT_EMITTER,
  TABLE_STATE,
} from '../../../../constants';
import Scheduler from '../../../scheduler';
import CommonEventEmitter from '../../../commonEventEmitter';
import scoreOfRound from '../scoreOfRound';
import { playerPlayingDataIf } from '../../../interface/playerPlayingTableIf';
import { playingTableIf } from '../../../interface/playingTableIf';
import { roundTableIf } from '../../../interface/roundTableIf';
import cancelBattle from '../../cancelBattle';
import Errors from '../../../errors';
import Validator from '../../../Validator';
import { winnerDeclareTimerIf } from '../../../interface/schedulerIf';

const winOfRound = async (tableId: string) => {
  logger.info(tableId, 'winOfRound : started with tableId : ', tableId);
  const { getLock } = global;
  const winOfRoundLock = await getLock.acquire([tableId], 2000);
  try {
    const playTable: playingTableIf = await getTableData(tableId);
    const { currentRound, isFTUE } = playTable;
    const tableGamePlay: roundTableIf = await getRoundTableData(
      tableId,
      currentRound,
    );
    const playersGameData: playerPlayingDataIf[] = await Promise.all(
      Object.keys(tableGamePlay.seats).map(async (ele) =>
        getPlayerGamePlay(tableGamePlay.seats[ele].userId, tableId),
      ),
    );

    logger.info(tableId, 
      'winOfRound : changeThrowCardTurn : playersGameData :: ',
      playersGameData,
      ' : winOfRound : tableGamePlaytableGamePlay :: ',
      tableGamePlay,
    );

    const { winSeatIndex }: any = await checkWinnerOfRound(tableGamePlay);
    tableGamePlay.turnCurrentCards = ['U-0', 'U-0', 'U-0', 'U-0'];
    const seat = tableGamePlay.seats;
    tableGamePlay.turnCardSequence = CARD_SEQUENCE.CARD_NONE;
    const index: any = Object.keys(seat).find(
      (key) => seat[key].seatIndex === winSeatIndex,
    );
    const winId = seat[index].userId;
    tableGamePlay.lastInitiater = winId;
    tableGamePlay.handCount += NUMERICAL.ONE;
    const playerGamePlay: playerPlayingDataIf = await getPlayerGamePlay(
      winId,
      tableId,
    );
    playerGamePlay.hands += NUMERICAL.ONE;
    await setPlayerGamePlay(winId, tableId, playerGamePlay);
    await setRoundTableData(tableId, currentRound, tableGamePlay);

    const eventData = {
      seatIndex: winSeatIndex,
      handCount: playerGamePlay.hands,
    };
    CommonEventEmitter.emit(EVENTS.WIN_OF_ROUND_SOCKET_EVENT, {
      tableId: tableId.toString(),
      data: eventData,
    });
    logger.info(tableId, 'winOfRound ::::: hand ::::', tableGamePlay.handCount);

    if (tableGamePlay.handCount !== NUMERICAL.THIRTEEN) {
      // set THIRTEEN
      playerGamePlay.isTurn = true;
      await setPlayerGamePlay(winId, tableId, playerGamePlay);
      logger.info(tableId, 'WIN_OF_ROUND ::  turn complete.', tableGamePlay.turnCount);

      // False only if isFTUE false or turnCount is not equal to 12
      if (!isFTUE || tableGamePlay.turnCount !== NUMERICAL.TWELVE) {
        await Scheduler.addJob.initialTurnSetupTimer({
          timer: NUMERICAL.ONE * NUMERICAL.THOUSAND, // change 2 to 1
          jobId: `${tableId}:${playTable.currentRound}`,
          tableData: playTable,
          playerGamePlayData: playersGameData,
          nextTurn: winId,
        });
      }
    } else {
      await Scheduler.addJob.winnerDeclareTimer({
        timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
        jobId: `${tableId}:${playTable.currentRound}`,
        tableId: tableId.toString(),
      });
    }
  } catch (e) {
    logger.error(tableId, `CATCH_ERROR : winOfRound : tableId: ${tableId} error ::`, e);
    if (e instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: e,
      });
    }
  } finally {
    logger.info(tableId, 'winOfRound : Lock : ', tableId);
    await getLock.release(winOfRoundLock);
  }
};

async function checkWinnerOfRound(roundGameData: roundTableIf) {
  try {
    roundGameData = await Validator.methodValidator.checkWinnerOfRoundValidator(
      roundGameData,
    );
    const seat = roundGameData.seats;
    const userId = roundGameData.lastInitiater;
    const userSeatString: string | undefined = Object.keys(seat).find(
      (key: string) => seat[key].userId === userId,
    );
    let lastInitiater: number = -1;
    if (typeof userSeatString !== 'undefined')
      lastInitiater = seat[userSeatString].seatIndex;
    let breakingSpades = '';
    if (roundGameData.breakingSpades) {
      breakingSpades = CARD_SEQUENCE.CARD_SPADES;
    }
    const round_Card = roundGameData.turnCurrentCards;
    let copy_Round_Card = roundGameData.turnCurrentCards;
    const turnCardSequence = roundGameData.turnCardSequence;
    let temp_Card: string[] = [];
    let win = -NUMERICAL.ONE;

    logger.info(
      'checkWinnerOfRound : userId :: ',
      userId,
      ' : checkWinnerOfRound : userSeatString :: ',
      userSeatString,
      ' : checkWinnerOfRound : lastInitiater :: ',
      lastInitiater,
      ' : checkWinnerOfRound : lastInitiater : typeof :: ',
      typeof lastInitiater,
      ' : checkWinnerOfRound : round_Card :: ',
      round_Card,
      ' : checkWinnerOfRound : copy_Round_Card :: ',
      copy_Round_Card,
      ' : checkWinnerOfRound : turnCardSequence :: ',
      turnCardSequence,
    );

    temp_Card.push(copy_Round_Card[lastInitiater]);
    // copy_Round_Card.forEach(() => {
    for (let i = NUMERICAL.ZERO; i < NUMERICAL.THREE; i++) {
      if (lastInitiater == NUMERICAL.THREE) {
        lastInitiater = NUMERICAL.ZERO;
        temp_Card.unshift(copy_Round_Card[lastInitiater]);
      } else {
        lastInitiater += NUMERICAL.ONE;
        temp_Card.unshift(copy_Round_Card[lastInitiater]);
      }
    }
    logger.info('checkWinnerOfRound : temp_Card :: ', temp_Card);
    copy_Round_Card = [...temp_Card];
    logger.info('checkWinnerOfRound : copy_Round_Card :: ', copy_Round_Card);
    for (let ci = 0; ci <= 3; ci++) {
      if (copy_Round_Card[ci].split('-')[1] === '1') {
        copy_Round_Card[ci] = copy_Round_Card[ci].split('-')[0] + '-' + '14';
      }
    }
    if (
      copy_Round_Card.length != NUMERICAL.FOUR ||
      turnCardSequence === CARD_SEQUENCE.CARD_NONE
    ) {
      logger.error('checkWinnerOfRound : Winner of turn :: ', roundGameData);
    } else {
      win = -NUMERICAL.ONE;

      for (let index = NUMERICAL.ZERO; index <= NUMERICAL.THREE; index++) {
        let currentCardSequence = copy_Round_Card[index].charAt(0);
        if (
          currentCardSequence === turnCardSequence ||
          currentCardSequence === breakingSpades
        ) {
          let winflag: number = -NUMERICAL.ONE;
          if (index === Number(NUMERICAL.THREE)) {
            winflag = index;
          } else {
            if (currentCardSequence === breakingSpades) {
              for (
                let index1 = NUMERICAL.ZERO;
                index1 <= NUMERICAL.THREE;
                index1++
              ) {
                if (copy_Round_Card[index1].charAt(0) === breakingSpades) {
                  if (
                    parseInt(copy_Round_Card[index].split('-')[1]) <
                    parseInt(copy_Round_Card[index1].split('-')[1])
                  ) {
                    winflag = -NUMERICAL.ONE;
                    break;
                  } else {
                    winflag = index;
                  }
                } else {
                  winflag = index;
                }
              }
            } else {
              for (
                let index2 = NUMERICAL.ZERO;
                index2 <= NUMERICAL.THREE;
                index2++
              ) {
                if (copy_Round_Card[index2].charAt(0) != breakingSpades) {
                  if (copy_Round_Card[index2].charAt(0) === turnCardSequence) {
                    logger.info(
                      "checkWinnerOfRound : parseInt(copy_Round_Card[index].split('-')[1]) :: ",
                      parseInt(copy_Round_Card[index].split('-')[1]),
                      " : checkWinnerOfRound : parseInt(copy_Round_Card[index2].split('-')[1]) :: ",
                      parseInt(copy_Round_Card[index2].split('-')[1]),
                    );

                    if (
                      parseInt(copy_Round_Card[index].split('-')[1]) <
                      parseInt(copy_Round_Card[index2].split('-')[1])
                    ) {
                      winflag = -NUMERICAL.ONE;
                      break;
                    } else {
                      winflag = index;
                    }
                  } else {
                    winflag = index;
                  }
                } else {
                  winflag = -NUMERICAL.ONE;
                  break;
                }
              }
            }
          }
          logger.info(
            'checkWinnerOfRound : temp_Card : temp_Card :: ',
            temp_Card,
            ' : checkWinnerOfRound : winflag : 23 :: ',
            winflag,
          );

          if (winflag != -NUMERICAL.ONE) {
            logger.info(
              'checkWinnerOfRound : round_Card : 11 :: ',
              round_Card,
              ' : checkWinnerOfRound : copy_Round_Card  : 22 :: ',
              copy_Round_Card,
              ' : checkWinnerOfRound : winflag :: ',
              winflag,
            );

            win = round_Card.indexOf(temp_Card[winflag]);
            logger.info('checkWinnerOfRound : win ::', win);
            const sendData = {
              winSeatIndex: win,
            };
            return sendData;
          }
        }
      }
    }
    return {
      winSeatIndex: [],
    };
  } catch (error) {
    logger.error(
      `CATCH_ERROR : checkWinnerOfRound : tableId: ${roundGameData.tableId} ::`,
      error,
    );
    throw error;
  }
}
CommonEventEmitter.on(
  EVENT_EMITTER.WINNER_DECLARE_TIMER,
  (res: winnerDeclareTimerIf) => {
    logger.info('call on : WINNER_DECLARE_TIMER :: ', res);
    scoreOfRound(res.tableId);
  },
);
export = winOfRound;
