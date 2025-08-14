export interface userDetailInScoreIf {
  username: string;
  profilePicture: string;
  seatIndex: number;
  userStatus : string;
}

export interface userScoreRoundIf {
  roundPoint: number;
  seatIndex: number;
}
export interface userScoreTotalIf {
  totalPoint: number;
  seatIndex: number;
}

export interface roundScoreWinnerIf {
  title: string;
  score: userScoreRoundIf[];
}

export interface winnLossAmountIf {
  seatIndex: number;
  userId: string;
  winningAmount: string;
}

export interface winningAmountIf {
  winnLossAmount : winnLossAmountIf[];
}

export interface mainRoundScoreIf {
  total: userScoreTotalIf[];
  scores: roundScoreWinnerIf[];
  users: userDetailInScoreIf[];
}

export interface userScoreIf {
  username: string;
  profilePicture: string;
  seatIndex: number;
  userId: string;
  bid: number;
  hands: number;
  isLeft: boolean;
  isAuto : boolean;
  roundBags: number;
  roundPoint: number;
  totalBags: number;
  BagsPenalty: number;
  totalPoint: number;
}

export interface showUserScoreIf {
  tableId: string;
}

export interface roundScoreIf {
  title: string;
  winner: Array<number | null>;
  roundScore: userScoreIf[];
  // total?: userScoreTotalIf[];
}
export interface allRoundScoreIf {
  history: roundScoreIf[];
}

export interface showUserScoreHelperIf {
  // metrics: metricsIf;
  data: showUserScoreIf;
}
