import { botGameConfigIf } from "./botIf";
import { playerPlayingDataIf } from "./playerPlayingTableIf";
import { playingTableIf } from "./playingTableIf";
import { roundTableIf } from "./roundTableIf";

export interface initializeGameplayIf {
  timer: number;
  queueKey: string;
  tableId: string;
  tableData: playingTableIf;
  roundTableData: roundTableIf;
}

export interface roundStartTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
  tableData: playingTableIf;
  roundTableData: roundTableIf;
}

export interface initialTurnSetupTimerIf {
  timer: number;
  jobId: string;
  tableData: playingTableIf;
  playerGamePlayData: playerPlayingDataIf[];
  nextTurn: string | number;
  dealerIndex?: number;
  dealerId?: string;
}

export interface playerBidTurnTimerIf {
  timer: number;
  jobId: string;
  tableData: playingTableIf;
  playerGamePlay?: playerPlayingDataIf,
}

export interface playerTurnTimerIf {
  timer: number;
  jobId: string;
  tableData: playingTableIf;
  playerGamePlay: playerPlayingDataIf;
  isAutoMode?: boolean;
}

export interface winOfRoundSetupTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
}

export interface winnerDeclareTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
}

export interface initialNewRoundStartTimerIf {
  timer: number;
  jobId: string;
  tableId: string;
  tie: boolean;
}

export interface findBotIf {
  timer: number;
  jobId: string;
  tableId: string;
  gameConfig: botGameConfigIf;
}
