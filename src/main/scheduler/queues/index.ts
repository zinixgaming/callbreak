import initializeGameplay from './initializeGameplay.queue';
import roundStartTimer from './roundStartTimer.queue';
import initialTurnSetupTimer from './initialTurnSetupTimer.queue';
import initialBidTurnSetupTimer from './initialBidTurnSetupTimer.queue';
import playerBidTurnTimer from './playerBidTurnTimer.queue';
import playerTurnTimer from './playerTurnTimer.queue';
import winOfRoundSetupTimer from './winOfRoundSetupTimer.queue';
import winnerDeclareTimer from './winnerDeclareTimer.queue';
import initialNewRoundStartTimer from './initialNewRoundStartTimer.queue';
import leaveTableTimer from './leaveTableTimer.queue';
import rejoinTimer from './rejoinTimer.queue';
import FTUE from './FTUE';
import BOT from './BOT';

const exportObject = {
  initializeGameplay,
  roundStartTimer,
  initialTurnSetupTimer,
  initialBidTurnSetupTimer,
  playerBidTurnTimer,
  playerTurnTimer,
  winOfRoundSetupTimer,
  winnerDeclareTimer,
  initialNewRoundStartTimer,
  leaveTableTimer,
  rejoinTimer,
  ...FTUE,
  ...BOT,
};
export = exportObject;
