import checkWinnerOfRoundSchema from './checkWinnerOfRoundSchema';
import chooseDealerSchema from './chooseDealerSchema';
import createTableSchema from './createTableSchema';
import distributeCardsSchema from './distributeCardsSchema';
import playerGamePlaySchema from './playerGamePlaySchema';
import playingTableSchema from './playingTableSchema';
import rejoinTableHistorySchema from './rejoinTableHistorySchema';
import roundTableSchema from './roundTableSchema';
import userDetailSchema from './userDetailSchema';
import checkWinnerSchema from './checkWinnerSchema';

const exportObject = {
  userDetailSchema,
  createTableSchema,
  roundTableSchema,
  playerGamePlaySchema,
  rejoinTableHistorySchema,
  playingTableSchema,
  chooseDealerSchema,
  distributeCardsSchema,
  checkWinnerOfRoundSchema,
  checkWinnerSchema,
};

export = exportObject;
