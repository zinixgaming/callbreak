export interface turnHistory {
  turnNo: number;
  userId: number;
  turnStatus: string;
  startState: Array<string>;
  cardThrow: string;
  endState: Array<string>;
  createdOn: Date;
  points: number;
}

export interface AllturnHistory {
  history: Array<turnHistory>;
}

export interface bidTurnHistory {
  turnNo: number;
  userId: number;
  turnStatus: string;
  startState: Array<string>;
  endState: string;
  createdOn: Date;
  bid: number;
}

export interface AllBidTurnHistory {
  history: Array<bidTurnHistory>;
}

export interface turnDetailsInterface {
  turnNo: number;
  userId: string;
  turnStatus: string;
  startState: Array<string> | string;
  cardPicked: string;
  cardPickSource: string;
  cardDiscarded: string;
  endState: Array<string> | string;
  createdOn: string;
}

export interface userDetailsIf {
  [key: string]: bidHistoryIf;
}
export interface bidHistoryIf {
  bidsMade?: number;
  bidsWon?: number;
  roundScore?: number;
  totalScore?: number;
}

export interface roundDetailsInterface {
  roundNo: number;
  roundId: string;
  winnerId: (string | '')[];
  winnerSI: any[];
  createdOn: string;
  modifiedOn: string;
  extra_info: string;
  userDetails: userDetailsIf;
  turnsDetails: Array<turnDetailsInterface>;
}
