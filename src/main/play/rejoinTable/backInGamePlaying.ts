import logger from '../../logger';
import CommonEventEmitter from '../../commonEventEmitter';
import {getPlayerGamePlay, setPlayerGamePlay} from '../../gameTable/utils';
import {EVENTS, PLAYER_STATE} from '../../../constants';
import {playerPlayingDataIf} from '../../interface/playerPlayingTableIf';
import socketAck from '../../../socketAck';

// handle Re-join User in Game for Inform All Player this Player is Back in game
const backInGamePlaying = async (
  socket: any,
  ack?: (response: any) => void,
) => {
  const {tableId, userId} = socket.eventMetaData;
  logger.info(
    tableId,
    ':: tableId : backInGamePlaying :: ',
    tableId,
    ':: socket.id : backInGamePlaying :: ',
    socket.id,
  );

  const {getLock} = global;
  const backInGamePlayingLock = await getLock.acquire([tableId], 2000);
  try {
    const playerPlayingData: playerPlayingDataIf = await getPlayerGamePlay(
      userId,
      tableId,
    );
    const seatIndex = playerPlayingData.seatIndex;
    playerPlayingData.isAuto = false;
    playerPlayingData.turnTimeout = 0;
    playerPlayingData.userStatus = PLAYER_STATE.PLAYING;
    await setPlayerGamePlay(userId, tableId, playerPlayingData);

    // send Back_in_Game_Playing Socket Event
    CommonEventEmitter.emit(EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT, {
      tableId: tableId,
      data: {seatIndex},
    });

    if (ack) {
      socketAck.ackMid(
        EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT,
        {
          success: true,
          error: null,
          tableId,
        },
        // socket.metrics,
        socket.userId,
        tableId,
        ack,
      );
    }
  } catch (error: any) {
    logger.error(
      tableId,
      `CATCH_ERROR : backInGamePlaying :: tableId: ${tableId} :: userId: ${userId}`,
      error,
    );

    if (ack) {
      socketAck.ackMid(
        EVENTS.BACK_IN_GAME_PLAYING_SOCKET_EVENT,
        {
          success: false,
          error: {
            errorCode: 401,
            errorMessage: error && error.message ? error.message : error,
          },
          tableId,
        },
        // socket.metrics,
        socket.userId,
        tableId,
        ack,
      );
    }
  } finally {
    await getLock.release(backInGamePlayingLock);
  }
};
export = backInGamePlaying;
