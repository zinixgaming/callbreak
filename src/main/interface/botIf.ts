export interface botDbDataIf {
  _id: string;
  userName: string;
  profilePic: string;
  userId: string;
  balance: number;
}

export interface botGameConfigIf {
  lobbyId: string;
  gameId: string;
  gameStartTimer: number;
  userTurnTimer: number;
  entryFee: number;
  totalRound: number;
  minPlayer: string;
  noOfPlayer: string;
  winningAmount: string;
  isUseBot: boolean;
  userAuthToken: string;
  moneyMode: string;
}
