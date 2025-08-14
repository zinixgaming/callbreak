import { getPlayerGamePlay, setPlayerGamePlay } from '../gameTable/utils';
import { userSeatsIf } from '../interface/roundTableIf';

// All User Card Add In Player Data
async function updateCardsByRoundId(
  seats: userSeatsIf,
  usersCards: string[][],
  tableId: string,
) {
  const playersGamePromise = await Object.keys(seats).map(async (seat) =>
    getPlayerGamePlay(seats[seat].userId, tableId),
  );

  const playersGameData = await Promise.all(playersGamePromise);
  const cachePromiseList = playersGameData.map((playerGameData, i) => {
    const updatedObj = {
      ...playerGameData,
      currentCards: usersCards[i],
      roundCards: usersCards[i],

    };
    setPlayerGamePlay(seats[`s${i}`].userId, tableId, updatedObj);
    return updatedObj;
  });

  return Promise.all(cachePromiseList);
}

const exportObject = {
  updateCardsByRoundId,
};
export = exportObject;
