import {userScoreIf} from '../../../interface/userScoreIf';
import {gameWinnerCount, gameLossCount} from '../../../gameCount';
import logger from '../../../logger';

function setGameCounter(userScore: userScoreIf[], winner: number[]) {
  try {
    const winnerUser = userScore.forEach(element => {
      if (element.seatIndex == winner[0]) {
        gameWinnerCount(element.userId.toString());
      } else {
        gameLossCount(element.userId.toString());
      }
    });
  } catch (error) {
    logger.error(
      'CATCH_ERROR: setGameCounter :: ',
      error,
      '-',
      userScore,
      winner,
    );
  }
}

export = setGameCounter;
