// no need metrics
export interface metricsIf {
  uuid: string;
  ctst: string;
  srct: number;
  srpt: string;
  crst: string;
  apkVersion: string;
  tableId: string;
}

export interface signUpRequestIf {
  userId: string;
  userName: string;
  lobbyId: string;
  isFTUE: boolean;
  gameModeId : string;
  gameId: string;
  totalRound: number;
  minPlayer: string;
  noOfPlayer: string;
  isUseBot: boolean;
  entryFee: number;
  moneyMode: string;
  rake: string;
  winningAmount: string;
  profilePic: string;
  fromBack?: boolean;
  deviceId: string;
  isAlredyPlaying? : boolean;
  isAnyRunningGame? : boolean;
  latitude?: string;
  longitude?: string;
}

export interface setBidRequestIf {
  bid: number;
}

export interface cardThrowRequestIf {
  card: string;
}

export interface leaveTableRequestIf {
  tableId: string;
  isLeaveFromScoreBoard : boolean;
}

export interface userRejoinRequestIf {
  userId: number;
}

export interface userJoinLobbyRequestIf {
  lobbyId: string;
}

export interface signUpHelperRequestIf {
  // metrics: metricsIf;
  data: signUpRequestIf;
}
export interface setBidHelperRequestIf {
  // metrics: metricsIf;
  data: setBidRequestIf;
}
export interface cardThrowHelperRequestIf {
  // metrics: metricsIf;
  data: cardThrowRequestIf;
}
export interface leaveTableHelperRequestIf {
  // metrics: metricsIf;
  data: leaveTableRequestIf;
}
export interface userRejoinHelperRequestIf {
  // metrics: metricsIf;
  data: userRejoinRequestIf;
}

export interface userJoinLobbyHelperRequestIf {
  data: userJoinLobbyRequestIf;
}

export interface gameTableInfoReq {
  entryFee: number;
  rake: number;
  numberOfRound: number;
  numberOfPlayer: number;
  numberOfcard: number;
}



export interface gameTableInfoRequestIf {
  userId: string;
}

export interface helpMenuRulsRequestIf {
  userId: string;
}

