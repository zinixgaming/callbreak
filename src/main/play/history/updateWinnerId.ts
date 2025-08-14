import logger  from '../../logger';
import { getTurnHistory, setTurnHistory } from '../../gameTable/utils';
import { playerPlayingDataIf } from '../../interface/playerPlayingTableIf';

async function updateWinnerId(
  tableId: string,
  roundNumber: number,
  playerGamePlay: playerPlayingDataIf[],
  winner: number[],
) {
  const turnHistory = await getTurnHistory(tableId, roundNumber);

  const [winnerData] = playerGamePlay
    .map((uData) => {
      logger.info(tableId, '===> uData L seatIndex<====', uData.seatIndex);
      logger.info(tableId, '===> uData L winner.indexOf(uData.seatIndex) <====', winner.indexOf(uData.seatIndex));
      if (winner.indexOf(uData.seatIndex) !== -1) {
        return {winnerId : [uData.userId], winnerSI : [uData.seatIndex]};
      }
      return {winnerId : [], winnerSI : []};
    })
    .filter((e) => e);

   logger.info(tableId, " winnerData ::>> ", winnerData);
    
  turnHistory.modifiedOn = new Date().toString();
  turnHistory.winnerId = winnerData.winnerId;
  turnHistory.winnerSI = winnerData.winnerSI;

  const history = await setTurnHistory(tableId, roundNumber, turnHistory);
  return history;
}

export = updateWinnerId;
