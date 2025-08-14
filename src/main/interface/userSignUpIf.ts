export interface userSignUpIf {
  _id: string;
  isFTUE: boolean;
  username: string;
  deviceId: string;
  fromBack: boolean;
  lobbyId: string;
  gameId: string;
  startTime: number;
  balance: number;
  userId: string;
  tableId: string;
  profilePicture: string;
  totalRound: number;
  minPlayer: string;
  noOfPlayer: string;
  winningAmount: string;
  rake: string;
  gameStartTimer: number;
  userTurnTimer: number;
  entryFee: number;
  longitude: string;
  latitude: string;
  authToken: string;
  isUseBot: boolean;
  isBot: boolean;
  inPlay?: boolean;
  moneyMode: string;
  isAnyRunningGame: boolean;
}

export interface userIf {
  _id: string;
  isFTUE: boolean;
  username: string;
  deviceId: string;
  fromBack: boolean;
  lobbyId: string;
  gameId: string;
  startTime: number;
  balance: number;
  userId: string;
  tableId: string;
  profilePicture: string;
  totalRound: number;
  minPlayer: string;
  noOfPlayer: string;
  winningAmount: string;
  rake: string;
  gameStartTimer: number;
  userTurnTimer: number;
  entryFee: number;
  authToken: string;
  longitude: string;
  latitude: string;
  socketId: string;
  isUseBot: boolean;
  isBot: boolean;
  moneyMode: string;
  isAnyRunningGame: boolean;
}

export interface getUserInDBIg {
  userId: number;
}

export interface rejoinIf {
  fromBack: boolean;
  userId: number | string;
}

export interface userGameDetail {
  csid: string;
  totalGamePlayed: number;
  totalGameWinn: number;
  totalGameLost: number;
}

export interface blockUserCheckI {
  tableId: string;
  isNewTableCreated: boolean;
}
