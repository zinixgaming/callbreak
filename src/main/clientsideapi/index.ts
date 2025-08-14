import { verifyUserProfile } from './verifyUserProfile';
import { getUserOwnProfile } from './getUserOwnProfile';
import { wallateDebit } from './walletDebit'
import { multiPlayerWinnScore } from './multiPlayerWinnScore'
import { gameSettinghelp } from './gameSettingMenuHelp'
import { checkBalance } from "./checkBalance";
import { rediusCheck } from "./rediusCheck";
import { firstTimeIntrection } from "./firstTimeIntrection";
import { markCompletedGameStatus } from "./markCompletedGameStatus";
import { checkUserBlockStatus } from "./checkUserBlockStatus";
import { checkMaintanence } from "./checkMaintanence";
import { multiPlayerDeductEntryFee } from "./multiPlayerDeductEntryFee";
import { addGameRunningStatus } from "./addGameRunningStatus";
import { getOneRobot } from './getOneRobot';



let exportedObj = {
  verifyUserProfile,
  getUserOwnProfile,
  wallateDebit,
  multiPlayerWinnScore,
  gameSettinghelp,
  checkBalance,
  rediusCheck,
  firstTimeIntrection,
  markCompletedGameStatus,
  checkUserBlockStatus,
  checkMaintanence,
  multiPlayerDeductEntryFee,
  getOneRobot,
  addGameRunningStatus
};

export = exportedObj;
