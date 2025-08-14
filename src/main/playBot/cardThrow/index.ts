import { CARD_SEQUENCE, TABLE_STATE } from '../../../constants';
import Scheduler from '../../scheduler';
import { getPlayerGamePlay, getRoundTableData } from '../../gameTable/utils';
import { playerPlayingDataIf } from '../../interface/playerPlayingTableIf';
import { playingTableIf } from '../../interface/playingTableIf';
import { roundTableIf } from '../../interface/roundTableIf';
import logger from '../../logger';
import firstTurn from './firstTurn';
import secondTurn from './secondTurn';
import cardThrow from '../../play/helpers/turn/cardThrow/cardThrow';

async function botCardThrow(
  playerGamePlay: playerPlayingDataIf,
  tableData: playingTableIf,
) {
  const { userId, currentCards } = playerGamePlay;
  const { _id: tableId, currentRound } = tableData;
  const { getLock, getConfigData: config } = global;
  const botCardThrowTurnLock = await getLock.acquire([tableId], 2000);
  try {
    logger.info(`botCardThrow : tableId :: ${tableId} :: userId: ${userId}`);

    const promises = await Promise.all([
      getPlayerGamePlay(userId, tableId),
      getRoundTableData(tableId, currentRound),
    ]);

    const playerObj: playerPlayingDataIf = promises[0];
    const roundObj: roundTableIf = promises[1];

    if (roundObj.tableState === TABLE_STATE.WINNER_DECLARED)
      throw new Error('This Table Declared Winner');

    if (roundObj.currentTurn !== userId || !playerObj.isTurn)
      throw new Error('current turn is not your turn !');

    const userCards = [...playerObj.currentCards];
    let cardSequence = roundObj.turnCardSequence;
    const roundCurrentCards = [...roundObj.turnCurrentCards];

    let indexSequence = -1;
    if (cardSequence === CARD_SEQUENCE.CARD_NONE) {
      // first card throw
      indexSequence = await firstTurn(playerGamePlay, userCards);
    } else {
      // second card throw
      indexSequence = await secondTurn(
        userCards,
        cardSequence,
        roundCurrentCards,
      );
    }

    let card = '';
    if (indexSequence !== -1) {
      card = userCards[indexSequence];
    } else {
      card = userCards[0];
    }
    logger.info('botCardThrow : card :: ', card);
    const cardIndex = currentCards.indexOf(card);
    if (cardIndex === -1)
      throw new Error('botCardThrow : current card is not your !');
    logger.info('botCardThrow :: call :: cardThrow.');
    cardThrow({ card }, { eventMetaData: { userId, tableId } });
  } catch (e) {
    logger.error(
      `CATCH_ERROR : botCardThrow tableId :: ${tableId} :: userId: ${userId} :: `,
      e,
    );
  } finally {
    logger.info('botCardThrow : Lock : ', tableId);
    await getLock.release(botCardThrowTurnLock);
  }
}

export = botCardThrow;
