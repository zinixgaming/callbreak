import initialBidTurnSetupTimerSchema from './initialBidTurnSetupTimerSchema';
import initializeGameplaySchedulerSchema from './initializeGameplaySchema';
import initialNewRoundStartTimerSchedulerSchema from './initialNewRoundStartTimerSchema';
import playerBidTurnTimerSchema from './playerBidTurnTimerSchema';
import playerTurnTimerSchema from './playerTurnTimerSchema';
import roundStartTimerSchedulerSchema from './roundStartTimerSchedulerSchema';
import winOfRoundSetupTimerSchedulerSchema from './winOfRoundSetupTimerSchema';
import findBotSchema from './findBotSchema';

const exportObject = {
  initializeGameplaySchedulerSchema,
  roundStartTimerSchedulerSchema,
  initialBidTurnSetupTimerSchema,
  playerBidTurnTimerSchema,
  winOfRoundSetupTimerSchedulerSchema,
  initialNewRoundStartTimerSchedulerSchema,
  playerTurnTimerSchema,
  findBotSchema,
};

export = exportObject;
