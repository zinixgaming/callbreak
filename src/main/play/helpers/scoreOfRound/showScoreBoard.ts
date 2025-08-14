import logger from '../../../logger';
import {
  getRoundScoreHistory,
  getTableData,
  getRoundTableData,
  getPlayerGamePlay,
} from '../../../gameTable/utils';
import CommonEventEmitter from '../../../commonEventEmitter';
import {EVENTS, MESSAGES, NUMERICAL, TABLE_STATE} from '../../../../constants';
import {showUserScoreIf, userScoreIf} from '../../../interface/userScoreIf';
import {playingTableIf} from '../../../interface/playingTableIf';
import {roundTableIf} from '../../../interface/roundTableIf';
import socketAck from '../../../../socketAck';
import cancelBattle from '../../cancelBattle';
import Errors from '../../../errors';
import Validator from '../../../Validator';
import {formatScoreData} from '../playHelper';
import {formatWinnerDeclareIf} from '../../../interface/responseIf';

//User Show Score Board in running Game
const showScoreBoard = async (
  data: showUserScoreIf,
  socket: any,
  ack?: (response: any) => void,
) => {
  const {tableId} = data;
  try {
    const playingTable: playingTableIf = await getTableData(tableId);
    const {currentRound} = playingTable;
    const roundPlayingTable: roundTableIf = await getRoundTableData(
      tableId,
      currentRound,
    );
    const playerSeats = roundPlayingTable.seats;

    const {isTieRound, currentTieRound} = roundPlayingTable;
    const playersPlayingData = await Promise.all(
      Object.keys(playerSeats).map(async ele =>
        getPlayerGamePlay(playerSeats[ele].userId, tableId),
      ),
    );
    const userScore: userScoreIf[] = [];
    let isUserLeft: boolean = false;
    let isUserLeftCount: number = 0;
    // set Default Data Of Currant Round Score
    playersPlayingData.forEach(async player => {
      const score: any = {};
      if (player != null) {
        const bid = player.bid;
        const hands = player.hands;
        score.userId = player.userId;
        score.username = player.username;
        score.profilePicture = player.profilePicture;
        score.seatIndex = player.seatIndex;
        score.bid = bid;
        score.hands = hands;
        score.roundBags = 0;
        score.roundPoint = 0;
        score.totalBags = 0;
        score.BagsPenalty = 0;
        score.totalPoint = player.point;
        score.isLeft = player.isLeft;
        score.isAuto = player.isAuto;
        if (player.isLeft) {
          isUserLeftCount += 1;
        }
        if (isUserLeftCount >= 3) {
          isUserLeft = true;
        }
      }
      userScore.push(score);
    });
    let title: string = '';
    if (isTieRound) {
      title = `${TABLE_STATE.TIE_ROUND_TITLE} ${currentTieRound}`;
    } else {
      title = `${TABLE_STATE.ROUND_TITLE} ${currentRound}`;
    }
    const addCurrantScour = {
      title,
      roundScore: userScore,
    };
    //get Old Table Score History
    let scoureHistory = await getRoundScoreHistory(tableId);
    logger.info(tableId, 'scoreHistory : ', scoureHistory);
    if (scoureHistory != null) scoureHistory = scoureHistory.history;
    logger.info(tableId, 'scoreHistory :: ', scoureHistory);
    if (scoureHistory === null) {
      //send SHOW_SCORE_BOARD event in socket
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: false,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.SCOREBOARD_POPUP,
          message: MESSAGES.ERROR.SCORE_BOARD_NOT_FOUND,
        },
      });
    } else {
      // scoureHistory.push(addCurrantScour);
      const roundScore = await formatScoreData(userScore, scoureHistory);

      let sendEventData: formatWinnerDeclareIf = {
        // timer: gameStartTimer,
        winner: [],
        roundScoreHistory: roundScore,
        roundTableId: tableId,
        nextRound: roundPlayingTable.currentRound,
      };

      sendEventData =
        // await Validator.responseValidator.formatShowScoreBoardValidator(
        //   scoureHistory,
        // );
        await Validator.responseValidator.formatWinnerDeclareValidator(
          sendEventData,
        );
      //send SHOW_SCORE_BOARD event in socket
      CommonEventEmitter.emit(EVENTS.SHOW_SCORE_BOARD, {
        socket,
        data: sendEventData,
      });
    }

    if (ack) {
      socketAck.ackMid(
        EVENTS.SHOW_SCORE_BOARD,
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
      `CATCH_ERROR : showScoreBoard :userId: ${socket.userId} :: tableId: ${tableId} Error :: `,
      error,
    );

    if (error instanceof Errors.CancelBattle) {
      await cancelBattle({
        tableId,
        errorMessage: error,
      });
    }
    if (ack) {
      socketAck.ackMid(
        EVENTS.SHOW_SCORE_BOARD,
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
  }
};
export = showScoreBoard;
