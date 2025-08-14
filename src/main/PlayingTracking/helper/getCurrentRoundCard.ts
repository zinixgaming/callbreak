import {userScoreIf} from '../../interface/userScoreIf';
import {getPlayerGamePlay, getUser} from '../../gameTable/utils';
import {logger} from '../..';

interface cardObjIf {
  userId: string;
  card: any[];
}

async function getCurrentRoundCard(
  userScore: userScoreIf[],
  tableId: string,
): Promise<any> {
  try {
    const card: cardObjIf[] = [];
    for (let index = 0; index < userScore.length; index++) {
      const element = userScore[index];
      const getplayerDetail = await getPlayerGamePlay(element.userId, tableId);

      const cardObj: cardObjIf = {
        userId: element.userId,
        card:
          getplayerDetail.roundCards && getplayerDetail.roundCards.length > 0
            ? getplayerDetail.roundCards
            : [],
      };
      card.push(cardObj);
    }

    return card;
  } catch (error) {
    logger.info(tableId, 'CATCH_ERROR : getCurrentRoundCard :>> ', error);
  }
}

export = getCurrentRoundCard;
