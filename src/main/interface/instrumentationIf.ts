import {playerPlayingDataIf} from './playerPlayingTableIf';
import {playingTableIf} from './playingTableIf';
import {roundTableIf} from './roundTableIf';

export interface userTableJoinedIf {
  tableData: playingTableIf;
  tableGamePlay: roundTableIf;
  userData: playerPlayingDataIf;
  isJoined: boolean;
  reason: string;
}
