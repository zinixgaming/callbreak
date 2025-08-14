import { userScoreIf } from '../../../interface/userScoreIf';
import logger from '../../../logger';
import { getTableData, getUser } from '../../../gameTable/utils'
import  {winnLossAmountIf,winningAmountIf}  from '../../../interface/userScoreIf'
import { NUMERICAL } from '../../../../constants';

async function showScoreBoardWinningAmount(userScore: userScoreIf[], winner: number[], tableId : string) :Promise<winnLossAmountIf[] | boolean> {
    try {
            let winningAmount : winnLossAmountIf[] = []
        
        for (let index = 0; index < userScore.length; index++) {
            if (userScore[index].seatIndex == winner[0]) {
                const tableData = await getTableData(tableId);
                // const getUserDetail = await getUser(userScore[index].userId);
                logger.info(tableId, " tableData is called", tableData);
                
                const winnprice = await tableData.winningAmount.toString()
                const resObj = {
                    seatIndex : userScore[index].seatIndex,
                    userId: userScore[index].userId,
                    winningAmount:  winnprice
                }
                winningAmount.push(resObj)

            } else {
                // const getUserDetail = await getUser(userScore[index].userId);
                const lossPrice = NUMERICAL.ZERO
                const resObj = {
                    seatIndex : userScore[index].seatIndex,
                    userId: userScore[index].userId,
                    winningAmount:  lossPrice.toString()
                }
                winningAmount.push(resObj)

            }
        }
        logger.info(tableId, 'showScoreBoardWinningAmount : winningAmount :>> ', winningAmount);
        return winningAmount;

    } catch (error) {
        logger.error(tableId, "CATCH_ERROR: showScoreBoardWinningAmount ::", error, "-", userScore, winner);
        return false;
    }
};

export = showScoreBoardWinningAmount;