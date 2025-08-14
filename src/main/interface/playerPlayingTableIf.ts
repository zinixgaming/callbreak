export interface defaultPlayerTableIf {
  _id: string;
  username: string;
  fromBack: boolean;
  lobbyId: string;
  gameId: string;
  startTime: number;
  userId: string;
  profilePicture: string;
  gameStartTimer: number;
  userTurnTimer: number;
  entryFee: number;
  authToken: string;
  socketId: string;
  roundTableId: string;
  seatIndex: number;
  isBot : boolean;
}

export interface playerPlayingDataIf {
  _id: string;
  userObjectId: string;
  userId: string;
  username: string;
  profilePicture: string;
  roundTableId: string;
  seatIndex: number;
  userStatus: string;
  isFirstTurn: boolean;
  socketId: string;
  currentCards: Array<any>;
  turnTimeout: number;
  bid: number;
  bidTurn: boolean;
  hands: number;
  bags: number;
  point: number;
  isLeft: boolean;
  isAuto: boolean;
  isTurn: boolean;
  isBot : boolean;
  createdAt: Date;
  updatedAt: Date;
  roundCards : Array<any>;
}
