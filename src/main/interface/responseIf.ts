import {playerPlayingDataIf} from './playerPlayingTableIf';
import {userSeatKeyIf} from './roundTableIf';
import {
  mainRoundScoreIf,
  roundScoreIf,
  userScoreTotalIf,
  winningAmountIf,
} from './userScoreIf';

export interface formatSingUpInfoIf {
  _id: string;
  userId: string;
  username: string;
  balance: number;
}

export interface formatUserProfileInfoIf {
  userId: number;
  username: string;
  profilePicture: string;
  phoneNumber: number;
  gamesPlayed: number;
  gameWon: number;
  gameLoss: number;
}

export interface formatGameTableInfoIf {
  isRejoin: boolean;
  bootValue: number;
  potValue: number;
  userTurnTimer: number;
  winningScores: Array<number>;
  tableId: string;
  roundTableId: string;
  totalPlayers: number;
  totalRound: number;
  currentRound: number;
  winnningAmonut: string;
  noOfPlayer: number;
  seats: Array<userSeatKeyIf>;
  seatIndex: number;
}

export interface formatRejoinTableInfoIf {
  isRejoin: boolean;
  bootValue: string;
  potValue: number;
  userTurnTimer: number;
  winningScores: Array<number>;
  roundTableId: string;
  tableId: string;
  tableState: string;
  totalPlayers: number;
  totalRound: number;
  currentRound: number;
  winnningAmonut: string;
  noOfPlayer: string;
  seatIndex: number;
  turnCurrentCards: string[];
  turnCardSequence: string;
  breakingSpades: boolean;
  currentTurn: number;
  dealerPlayer: number;
  isBidTurn: boolean | undefined;
  currentTurnTimer: number | undefined;
  userBalance: number;
  remaningRoundTimer: number;
  playarDetail: playerPlayingDataIf[];
  massage: string;
}

export interface upadedBalanceIf {
  userId: string;
  balance: number;
}

export interface formatCollectBootValueIf {
  bootValue: number;
  userIds: Array<string>;
  balance: upadedBalanceIf[];
}

export interface formatStartUserBidTurnIf {
  time: number;
  seatIndexList: number[];
  bid?: number;
}

export interface formatCardDistributionIf {
  cards: Array<string>;
  dealer: number;
  currentRound: number;
}

export interface formentUserBidShowIf {
  seatIndex: number;
  bid: number;
}

interface playarDetail {
  seatIndex: number;
  userId: string;
  username: string;
  profilePicture: string;
}
export interface formatJoinTableInfoIf {
  totalPlayers: number;
  playarDetail: playarDetail;
}

export interface formatStartUserTurnIf {
  seatIndex: number;
  time: number;
  cardSequence: string;
  card: string[];
}
export interface formatWinnerDeclareIf {
  timer?: number;
  roundScoreHistory: mainRoundScoreIf;
  roundTableId: string;
  winningAmount?: winningAmountIf;
  winner: Array<number | null>;
  nextRound: number;
}
export interface formantUserThrowCardShowIf {
  seatIndex: number;
  card: string;
  breakingSpades: boolean;
  turnTimeout: boolean;
}
