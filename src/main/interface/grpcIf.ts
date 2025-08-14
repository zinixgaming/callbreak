export interface checkPlayerEligibilityResIF {
  lobbyId: number;
  userId: number;
  tableId: string;
}
export interface checkPlayerEligibilityReqIF {
  lobbyId: number;
  userId: number;
  activeTablePresent: boolean;
  activeTableId: string;
}
export interface createCardGameTableReqIF {
  lobbyId: number;
  gameId: number;
  gameTableId: string;
  // @ts-expect-error - userIdToSessionIds type is not properly defined
  userIdToSessionIds;
  requestId?: string;
}

export interface updateCardGameTableIF {
  lobbyId: number;
  tableId: string;
  roundId: string | number;
  scoreData: string;
  userScoreData: userScoreDataForGrpc[];
  requestId?: string;
}

export interface getLobbyDetailsReqIf {
  requestId: string;
  lobbyId: number;
  isFTUE: boolean;
}

export interface getBasicProfileReqIf {
  requestId: string;
  userId: number;
}

export interface userScoreDataForGrpc {
  userId: string;
  gameScore: number;
  // gameEndReason: string;
  // rummyType: string;
  // lobbyId: number;
  // uniqueId: string;
  // startingUsersCount: number;
}

export interface grpcRequestsMapIF {
  [key: string]: number;
}
