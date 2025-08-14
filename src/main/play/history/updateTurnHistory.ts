import { getTurnHistory, setTurnHistory } from '../../gameTable/utils';
import { playerPlayingDataIf } from '../../interface/playerPlayingTableIf';
import { turnDetailsInterface } from '../../interface/turnHistoryIf';

async function updateTurnHistory(
  tableId: string,
  roundNumber: number,
  playerGamePlay: playerPlayingDataIf,
  turnStatus: string,
  card: string,
  userCards: Array<string>,
) {
  const turnHistory = await getTurnHistory(tableId, roundNumber);

  const defaultTurnHistoryObj: turnDetailsInterface = {
    turnNo: turnHistory.turnsDetails.length + 1,
    userId: playerGamePlay.userId,
    turnStatus: turnStatus,
    startState: playerGamePlay.currentCards.join(','),
    cardPicked: '',
    cardPickSource: '',
    cardDiscarded: card,
    endState: userCards.join(','),
    createdOn: new Date().toString(),
  };

  turnHistory.modifiedOn = new Date().toString();
  turnHistory.turnsDetails.push(defaultTurnHistoryObj);

  const history = await setTurnHistory(tableId, roundNumber, turnHistory);
  return history;
}

export = updateTurnHistory;
