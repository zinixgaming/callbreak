import {getUser} from '../../gameTable/utils';
import {userScoreIf, winnLossAmountIf} from '../../interface/userScoreIf';
import logger from '../../logger';
import DB from '../../db';
import {MONGO} from '../../../constants';

async function setCurrentRoundData(
  tableId: string,
  data: any,
  userScore: userScoreIf[],
  winningAmount: winnLossAmountIf[],
): Promise<any> {
  try {
    const userId = userScore[0].userId;
    const userDetail = await getUser(userId);
    const findFlageQuery = {
      gameId: userDetail.gameId,
    };
    const findFlage = await DB.mongoQuery.getOne(MONGO.FLAGE, findFlageQuery);
    logger.info(tableId, 'setCurrentRoundData :: findFlage :>> ', findFlage);

    if (findFlage && findFlage.isPlayingTracking == true) {
      const histroyArray: any[] = [];
      const createdAt = new Date();
      let histroyObj = {};
      data.forEach(async (element: any) => {
        histroyObj = {
          title: element.title,
          card: element.currantRoundCard,
          roundScore: element.roundScore,
        };
        histroyArray.push(histroyObj);
      });

      const resObj = {
        tableId,
        histroy: histroyArray,
        winningAmount,
        createdAt: createdAt.toLocaleDateString('en-US'),
      };
      const query = {
        tableId: tableId,
      };

      const getHistory = await DB.mongoQuery.getOne(
        MONGO.PLAYING_TRACKING_HISTORY,
        query,
      );

      if (!getHistory) {
        const trackedHistory = await DB.mongoQuery.add(
          MONGO.PLAYING_TRACKING_HISTORY,
          resObj,
        );
        logger.info(
          tableId,
          'setCurrentRoundData :: playingTrackingHistroy :: ',
          trackedHistory,
        );
      }
    } else {
      // round data not tracked
    }
  } catch (error) {
    logger.error(
      tableId,
      'CATCH_ERROR : setCurrentRoundData :>> ',
      error,
      ' - ',
    );
  }
}

export = setCurrentRoundData;
