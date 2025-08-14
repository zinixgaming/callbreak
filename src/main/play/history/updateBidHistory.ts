import logger from '../../logger';
import { getTurnHistory, setTurnHistory } from '../../gameTable/utils';
import { userDetailsIf } from '../../interface/turnHistoryIf';
import { userScoreIf } from '../../interface/userScoreIf';

async function updateBidHistory(
  tableId: string,
  roundNumber: number,
  userScore: userScoreIf[],
) {
  logger.info(tableId, 'updateBidHistory : userScore : ', userScore);
  const turnHistory = await getTurnHistory(tableId, roundNumber);
  let history;
  logger.info(tableId, 'updateBidHistory :: turnHistory ::>', turnHistory);
  if (
    typeof turnHistory !== null &&
    typeof turnHistory.userDetails !== 'undefined'
  ) {
    const userDetailsObj: userDetailsIf = turnHistory.userDetails;

    userScore.forEach((playerScore) => {
      userDetailsObj[`${playerScore.userId}`] = {
        bidsMade: playerScore.bid,
        bidsWon: playerScore.hands,
        roundScore: playerScore.roundPoint,
        totalScore: playerScore.totalPoint,
      };
    });

    turnHistory.modifiedOn = new Date().toString();
    turnHistory.userDetails = userDetailsObj;

    history = await setTurnHistory(tableId, roundNumber, turnHistory);
  }
  return history;
}

export = updateBidHistory;
