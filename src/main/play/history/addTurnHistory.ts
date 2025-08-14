import {setTurnHistory} from '../../gameTable/utils';
import {roundTableIf} from '../../interface/roundTableIf';
import {roundDetailsInterface} from '../../interface/turnHistoryIf';

async function addTurnHistory(tableId: string, roundTable: roundTableIf) {
  try {
    const currentTime = new Date();
    // "708845":{"bidsMade":4,"bidsWon":3,"roundScore":-4,"totalScore":-4}
    const defaultRoundHistory: roundDetailsInterface = {
      roundNo: roundTable.currentRound,
      roundId: roundTable._id,
      winnerId: [],
      winnerSI: [],
      createdOn: currentTime.toString(),
      modifiedOn: currentTime.toString(),
      extra_info: '',
      userDetails: {},
      turnsDetails: [],
    };

    const turnHistory = await setTurnHistory(
      tableId,
      roundTable.currentRound,
      defaultRoundHistory,
    );
    return turnHistory;
  } catch (e) {
    // Handle error silently
    return null;
  }
}
export = addTurnHistory;
