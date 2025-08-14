import {lobbyValidator} from '../../Validator';
import {getUser} from '../../gameTable/utils';
import logger from '../../logger';
import DB from '../../db';
import {MONGO} from '../../../constants';
import {userIf} from '../../interface/userSignUpIf';
import {addLobbyDetailsIf} from '../../interface/cmgApiIf';

async function addLobbyTracking(userId: string, tableId: string): Promise<any> {
  try {
    const getUserDeatil: userIf = await getUser(userId);
    logger.info('addLobbyTracking ::  getUserDeatil :: ', getUserDeatil);
    const findFlageQuery = {
      gameId: getUserDeatil.gameId,
    };
    const findFlage = await DB.mongoQuery.getOne(MONGO.FLAGE, findFlageQuery);
    logger.info('addLobbyTracking  :: findFlage :: ', findFlage);
    if (findFlage && findFlage.isPlayingTracking == true) {
      const createdAt = new Date();
      const resObj: addLobbyDetailsIf = {
        tableId: tableId,
        lobbyId: getUserDeatil.lobbyId,
        entryFee: getUserDeatil.entryFee,
        winningAmount: getUserDeatil.winningAmount,
        noOfPlayer: getUserDeatil.noOfPlayer,
        totalRound: getUserDeatil.totalRound,
        createdAt: createdAt.toLocaleDateString('en-US'),
      };
      const trackLobby = await lobbyValidator.lobbyEntryValidator(resObj);
      await DB.mongoQuery.add(MONGO.PLAYING_TRACKING_LOBBY, trackLobby);
      logger.info(tableId, 'addLobbyTracking : trackLobby ::', trackLobby);
    } else {
      // data not track
    }
  } catch (error) {
    logger.error(
      tableId,
      'CATCH_ERROR : getLobbyEntry :>> ',
      error,
      ' - ',
      userId,
    );
  }
}

export = addLobbyTracking;
