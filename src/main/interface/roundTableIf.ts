export interface defaultRoundTableIf {
  tableId: string;
  noOfPlayer: string;
  currantRound: number;
}

export interface roundTableIf {
  _id: string;
  tableId: string;
  tableState: string;
  tableCurrentTimer: any;
  totalPlayers: number;
  noOfPlayer: string;
  currentRound: number;
  totalHands: number;
  seats: userSeatsIf;
  turnCurrentCards: string[];
  turnCardSequence: string;
  lastInitiater: string | null;
  dealerPlayer?: any;
  breakingSpades: boolean;
  hands: Array<any>;
  turnCount: number;
  handCount: number;
  currentTurn: any;
  isTieRound: boolean;
  currentTieRound: number;
  currentPlayerInTable?: number;
  isBidTurn?: boolean;
  currentTurnTimer?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface userSeatKeyIf {
  _id?: string;
  userId: string;
  username?: string;
  profilePicture?: string;
  seatIndex?: number;
}

interface IObjectKeys {
  [key: string]: any;
}

// export interface userSeatsIf extends Record<string, any> {
export interface userSeatsIf extends IObjectKeys {
  s0: userSeatKeyIf;
  s1: userSeatKeyIf;
  s2?: userSeatKeyIf;
  s3?: userSeatKeyIf;
}
