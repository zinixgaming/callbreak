export interface defaultPlayingTableIf {
  gameType: string;
  lobbyId: string;
  gameId: string;
  totalRounds: number;
  winningScores: number[];
  gameStartTimer: number;
  userTurnTimer: number;
  bootValue: number;
  isFTUE: boolean;
  winningAmount: string;
  isUseBot: boolean;
}

export interface playingTableIf {
  _id: string;
  gameType: string;
  totalRounds: number;
  currentRound: number;
  lobbyId: string;
  gameId: string;
  winningScores: number[];
  gameStartTimer: number;
  userTurnTimer: number;
  bootValue: number;
  potValue: number;
  winner: Array<any>;
  isFTUE: boolean;
  winningAmount: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RejoinTableHistoryIf {
  userId: string;
  tableId: string;
  isEndGame: boolean;
}
