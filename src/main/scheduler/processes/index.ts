import initializeGameplayProcess from './initializeGameplay.process';
import roundStartTimerProcess from './roundStartTimer.process';
import initialTurnSetupTimerProcess from './initialTurnSetupTimer.process';
import initialBidTurnSetupTimerProcess from './initialBidTurnSetupTimer.process';
import playerBidTurnTimerProcess from './playerBidTurnTimer.process';
import playerTurnTimerProcess from './playerTurnTimer.Process';
import winOfRoundSetupTimerProcess from './winOfRoundSetupTimer.process';
import winnerDeclareTimerProcess from './winnerDeclareTimer.process';
import initialNewRoundStartTimerProcess from './initialNewRoundStartTimer.process';
import leaveTableTimerProcess from './leaveTableTimer.process';
import rejoinTimerProcess from './rejoinTimer.process';
import FTUE from './FTUE';
import BOT from './BOT';

const exportObject = {
  initializeGameplayProcess,
  roundStartTimerProcess,
  initialTurnSetupTimerProcess,
  initialBidTurnSetupTimerProcess,
  playerBidTurnTimerProcess,
  playerTurnTimerProcess,
  winOfRoundSetupTimerProcess,
  winnerDeclareTimerProcess,
  initialNewRoundStartTimerProcess,
  leaveTableTimerProcess,
  rejoinTimerProcess,
  ...FTUE,
  ...BOT
};
export = exportObject;
