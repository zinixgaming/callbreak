import {playerPlayingDataIf} from './playerPlayingTableIf';

export interface eventDataIf {
  usersCards: string[][];
  playersData: playerPlayingDataIf[];
  dealerId: number;
  seatIndex: number;
  currentRound: number;
}

export interface updateObjIf {
  dealerPlayer: string;
  tableState: string;
  potValue: number;
}
export interface optionsIf {
  currentRound: number;
  tableId: string;
}

export interface setupRoundIf {
  tableId: string;
  roundNo: number;
  noOfPlayer: string;
}
