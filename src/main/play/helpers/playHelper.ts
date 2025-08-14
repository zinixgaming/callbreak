import logger from "../../logger";
import { playerPlayingDataIf } from "../../interface/playerPlayingTableIf";
import { playingTableIf } from "../../interface/playingTableIf";
import {
  formantUserThrowCardShowIf,
  formatCardDistributionIf,
  formatCollectBootValueIf,
  formatGameTableInfoIf,
  formatJoinTableInfoIf,
  formatRejoinTableInfoIf,
  formatSingUpInfoIf,
  formatStartUserBidTurnIf,
  formatStartUserTurnIf,
  formatWinnerDeclareIf,
  formentUserBidShowIf,
} from "../../interface/responseIf";
import { roundTableIf } from "../../interface/roundTableIf";
import { eventDataIf } from "../../interface/startRoundIf";
import { userIf } from "../../interface/userSignUpIf";
import Validator from "../../Validator";
import Errors from "../../errors";
import { EMPTY, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../../constants";
import { userThrowCardTips } from "../../FTUE/common";
import {
  mainRoundScoreIf,
  roundScoreIf,
  roundScoreWinnerIf,
  userDetailInScoreIf,
  userScoreIf,
  userScoreRoundIf,
  userScoreTotalIf,
} from "../../interface/userScoreIf";
import { upadedBalanceIf } from '../../interface/responseIf'
import leaveTable from "../leaveTable";

// Formant Collect Boot Value Event Document
async function formatCollectBootValue({ userIds }: any, bootValue: number, balance: upadedBalanceIf[]) {
  try {
    let resObj = { bootValue, userIds, balance };

    resObj = await Validator.responseValidator.formatCollectBootValueValidator(
      resObj
    );
    return resObj;
  } catch (error) {
    logger.error(userIds, 
      "CATCH_ERROR : formatCollectBootValue :: ",
      userIds,
      bootValue,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant card Distribution Event Document
async function formatCardDistribution(data: eventDataIf) {
  try {
    const { seatIndex, usersCards, dealerId, currentRound } = data;

    let resObj: formatCardDistributionIf = {
      cards: usersCards[seatIndex],
      dealer: dealerId,
      currentRound
    };
    resObj = await Validator.responseValidator.formatCardDistributionValidator(
      resObj
    );
    return resObj;
  } catch (error) {
    logger.error("CATCH_ERROR : formatCardDistribution :: ", data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant Game Table Info Event Document
const formatGameTableInfo = async (
  tableData: playingTableIf,
  roundTableData: roundTableIf,
  extra: any
) => {
  try {
    const seats: any = [];
    const tempRoundTableData: any = { ...roundTableData };
    Object.keys(tempRoundTableData.seats).map(async (key) =>
      seats.push(tempRoundTableData.seats[key])
    );
    tempRoundTableData.seats = seats;
    logger.info(roundTableData.tableId, "tempRoundTableData :: ", tempRoundTableData);
    let resObj: formatGameTableInfoIf = {
      isRejoin: false,
      isFTUE: tableData.isFTUE,
      bootValue: tableData.bootValue,
      potValue: tableData.potValue,
      userTurnTimer: tableData.userTurnTimer,
      winningScores: tableData.winningScores,
      roundTableId: tempRoundTableData._id,
      tableId: tempRoundTableData.tableId,
      totalPlayers: tempRoundTableData.totalPlayers,
      totalRound: tableData.totalRounds,
      currentRound: tempRoundTableData.currentRound,
      winnningAmonut: tableData.winningAmount,
      noOfPlayer: tempRoundTableData.noOfPlayer,
      seats: tempRoundTableData.seats,
      ...extra,
    };
    resObj = await Validator.responseValidator.formatGameTableInfoValidator(
      resObj
    );
    return resObj;
  } catch (error) {
    logger.error(roundTableData.tableId, 
      "CATCH_ERROR : formatGameTableInfo :: ",
      tableData,
      roundTableData,
      extra,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
};

// Formant Join Table Event Document
async function formatJoinTableInfo(
  seatIndex: number,
  roundTableData: roundTableIf
) {
  try {
    let data: formatJoinTableInfoIf = {
      totalPlayers: roundTableData.totalPlayers,
      playarDetail: {
        seatIndex,
        userId: roundTableData.seats[`s${seatIndex}`].userId,
        username: roundTableData.seats[`s${seatIndex}`].username,
        profilePicture: roundTableData.seats[`s${seatIndex}`].profilePicture,
      },
    };
    data = await Validator.responseValidator.formatJoinTableInfoValidator(data);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatJoinTableInfo :: ",
      seatIndex,
      roundTableData,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant Start Turn Event Document
async function formatStartUserTurn(
  playerGamePlay: playerPlayingDataIf,
  tableData: playingTableIf,
  tableGameData: roundTableIf
) {
  try {
    logger.info("formatStartUserTurn :: ", tableGameData.turnCardSequence);
    logger.info(
      "formatStartUserTurn :: tableGameData.turnCount :",
      tableGameData.turnCount
    );
    let data: formatStartUserTurnIf = {
      seatIndex: playerGamePlay.seatIndex,
      time: tableData.userTurnTimer,
      cardSequence: tableGameData.turnCardSequence,
      card: tableGameData.turnCurrentCards,
    };

    // if (
    //   tableData.isFTUE &&
    //   playerGamePlay.seatIndex === NUMERICAL.ZERO &&
    //   (tableGameData.turnCount === NUMERICAL.FOUR ||
    //     tableGameData.turnCount === NUMERICAL.FIVE ||
    //     tableGameData.turnCount === NUMERICAL.TWELVE)
    // ) {
    //   const { card } = await userThrowCardTips(
    //     playerGamePlay.currentCards,
    //     tableGameData.turnCount,
    //   );
    //   logger.info('formatStartUserTurn :: FTUE CARD :', card);
    //   if (card !== '') data.card = card;
    // }
    data = await Validator.responseValidator.formatStartUserTurnValidator(data);
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatStartUserTurn :: ",
      playerGamePlay,
      tableData,
      tableGameData,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}
// Formant Bid Turn Event Document
async function formatStartUserBidTurn(
  tableData: playingTableIf,
  seatIndexList : number[]
) {
  try {
    let data: formatStartUserBidTurnIf = {
      time: tableData.userTurnTimer,
      seatIndexList
    };
    data = await Validator.responseValidator.formatStartUserBidTurnValidator(
      data
    );
    return data;
  } catch (error) {
    logger.error(
      "CATCH_ERROR : formatStartUserBidTurn :: ",
      tableData,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant Rejoin Event Document
const formatRejoinTableInfo = async (
  playerPlayingData: playerPlayingDataIf,
  tableData: playingTableIf,
  roundTableData: roundTableIf,
  extra: any,
  userBalance: number
) => {
  const tempRoundTableData = { ...roundTableData };
  try {
    let massage = EMPTY;
    const { getConfigData: config } = global;
    if (tempRoundTableData.dealerPlayer == null)
      tempRoundTableData.dealerPlayer = -1;
    if (tempRoundTableData.tableCurrentTimer == null)
      tempRoundTableData.tableCurrentTimer = -1;
    if(roundTableData.tableState === TABLE_STATE.LOCK_IN_PERIOD){
      massage = config.LOCK_IN_PERIOD;
    }
    for (let i = 0; i < Number(tempRoundTableData.noOfPlayer); i++) {
      if (
        typeof extra[i].seatIndex != "undefined" &&
        extra[i].seatIndex != playerPlayingData.seatIndex
      ) {
        extra[i].currentCards = [];
        delete extra[i].createdAt;
        delete extra[i].updatedAt;
      } else if (typeof extra[i].seatIndex != "undefined") {
        delete extra[i].createdAt;
        delete extra[i].updatedAt;
      }
    }
    let data: formatRejoinTableInfoIf = {
      isRejoin: true,
      bootValue: String(tableData.bootValue),
      userTurnTimer: tableData.userTurnTimer,
      winningScores: tableData.winningScores,
      seatIndex: playerPlayingData.seatIndex,
      roundTableId: tempRoundTableData._id,
      tableId: tempRoundTableData.tableId,
      tableState: tempRoundTableData.tableState,
      totalPlayers: tempRoundTableData.totalPlayers,
      totalRound: tableData.totalRounds,
      currentRound: tempRoundTableData.currentRound,
      winnningAmonut: tableData.winningAmount,
      noOfPlayer: tempRoundTableData.noOfPlayer,
      turnCurrentCards: tempRoundTableData.turnCurrentCards,
      turnCardSequence: tempRoundTableData.turnCardSequence,
      breakingSpades: tempRoundTableData.breakingSpades,
      currentTurn: tempRoundTableData.currentTurn,
      dealerPlayer: tempRoundTableData.dealerPlayer,
      isBidTurn: tempRoundTableData.isBidTurn,
      currentTurnTimer: tempRoundTableData.currentTurnTimer,
      potValue: tableData.potValue,
      userBalance : Number(userBalance.toFixed(2)),
      remaningRoundTimer : tableData.gameStartTimer,
      massage : massage,
      playarDetail: extra,
    };
    data = await Validator.responseValidator.formatRejoinTableInfoValidator(
      data
    );
    return data;
  } catch (error) {
    logger.error(tempRoundTableData.tableId, 
      "CATCH_ERROR : formatRejoinTableInfo :: ",
      playerPlayingData,
      tableData,
      roundTableData,
      extra,
      error
    );
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
};

// get date time Difference
const getTimeDifference = (startTime: Date, endTime: Date) => {
  const oldTime: any = new Date(startTime);
  const currentTime: any = new Date(endTime);

  const diff = currentTime - oldTime;
  const difftime = Math.round(diff / 1000); // send time In Secound

  return difftime;
};

// function rearrangedSeats(seats: any, dealerIndex: number) {
//   const returnValue: any[] = [];
//   let loopTill = seats.length;

//   for (let i = dealerIndex; i < loopTill; ++i) {
//     returnValue.push({ _id: seats[i], seat: i });
//   }

//   loopTill = dealerIndex;

//   for (let i = 0; i < loopTill; ++i) {
//     returnValue.push({ _id: seats[i], seat: i });
//   }

//   return returnValue;
// }

// Formant SingUp Event Document
async function formatSingUpInfo(userData: userIf): Promise<formatSingUpInfoIf> {
  try {
    let data = {
      _id: userData._id,
      userId: userData.userId,
      username: userData.username,
      balance: Number(userData.balance.toFixed(2)),
    };
    data = await Validator.responseValidator.formatSingUpInfoValidator(data);
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : formatSingUpInfo :: ", userData, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant User Throw Card Show Document
async function formatUserThrowCardShow(
  data: formantUserThrowCardShowIf
): Promise<formantUserThrowCardShowIf> {
  try {
    data = await Validator.responseValidator.formatUserThrowCardShowValidator(
      data
    );
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : formatUserThrowCardShow :: ", data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

// Formant User Bid Show Document
async function formatUserBidShow(
  data: formentUserBidShowIf
): Promise<formentUserBidShowIf> {
  try {
    data = await Validator.responseValidator.formatUserBidShowValidator(data);
    return data;
  } catch (error) {
    logger.error("CATCH_ERROR : formatUserBidShow :: ", data, error);
    if (error instanceof Errors.CancelBattle) {
      throw new Errors.CancelBattle(error);
    }
    throw error;
  }
}

async function formatScoreData(
  userScore: userScoreIf[],
  roundScoreHistory: roundScoreIf[]
  // userDetailInScore: userDetailInScoreIf[],
  // userScoreTotal: userScoreTotalIf[],
): Promise<mainRoundScoreIf> {
  const roundScoreWinner: roundScoreWinnerIf[] = [];
  const userDetailInScore: userDetailInScoreIf[] = [];
  const userScoreTotal: userScoreTotalIf[] = [];
  userScore.forEach((element) => {
    // userRoundScore.push({
    //   roundPoint: element.roundPoint,
    //   seatIndex: element.seatIndex,
    // });
    let userStatus : string = PLAYER_STATE.PLAYING;
    if(element.isAuto === true) userStatus =  PLAYER_STATE.DISCONNECTED;
    if(element.isLeft === true) userStatus =  PLAYER_STATE.LEFT;

    userDetailInScore.push({
      username: element.username,
      profilePicture: element.profilePicture,
      seatIndex: element.seatIndex,
      userStatus
    });
    userScoreTotal.push({
      totalPoint: Number(element.totalPoint.toFixed(1)),
      seatIndex: element.seatIndex,
    });
  });

  roundScoreHistory.forEach((element) => {
    const userScores: userScoreRoundIf[] = [];
    element.roundScore.forEach((uScore) => {
      userScores.push({
        roundPoint: Number(uScore.roundPoint.toFixed(1)),
        seatIndex: uScore.seatIndex,
      });
    });

    roundScoreWinner.push({
      title: element.title,
      score: userScores,
    });
  });

  const sendObject = {
    total: userScoreTotal,
    scores: roundScoreWinner,
    users: userDetailInScore,
  };

  return sendObject;
}
async function formatScoreDataForWinner(
  // userScore: userScoreIf[],
  roundScoreHistory: roundScoreIf[]
  // userDetailInScore: userDetailInScoreIf[],
  // userScoreTotal: userScoreTotalIf[],
): Promise<mainRoundScoreIf> {
  // logger.info(`roundScoreHistory  :: >> `, roundScoreHistory);
  const roundScoreWinner: roundScoreWinnerIf[] = [];
  const userDetailInScore: userDetailInScoreIf[] = [];
  const userScoreTotal: userScoreTotalIf[] = [];
  // userScore.forEach((element) => {
  //   // userRoundScore.push({
  //   //   roundPoint: element.roundPoint,
  //   //   seatIndex: element.seatIndex,
  //   // });
  //   userDetailInScore.push({
  //     username: element.username,
  //     profilePicture: element.profilePicture,
  //     seatIndex: element.seatIndex,
  //   });
  //   userScoreTotal.push({
  //     totalPoint: element.totalPoint,
  //     seatIndex: element.seatIndex,
  //   });
  // });

  roundScoreHistory.forEach((element) => {
    const userScores: userScoreRoundIf[] = [];
    element.roundScore.forEach((uScore) => {

      // logger.info('uScore :=>> ', uScore);
      userScores.push({
        roundPoint: Number(uScore.roundPoint.toFixed(1)),
        seatIndex: uScore.seatIndex,
      });

      let userStatus : string = PLAYER_STATE.PLAYING;
      if(uScore.isAuto === true) userStatus =  PLAYER_STATE.DISCONNECTED;
      if(uScore.isLeft === true) userStatus =  PLAYER_STATE.LEFT;

      userDetailInScore[`${uScore.seatIndex}`] = {
        username: uScore.username,
        profilePicture: uScore.profilePicture,
        seatIndex: uScore.seatIndex,
        userStatus
      };

      userScoreTotal[`${uScore.seatIndex}`] = {
        totalPoint: 
            /*(userScoreTotal[uScore.seatIndex] && userScoreTotal[uScore.seatIndex].totalPoint)
            ? (userScoreTotal[uScore.seatIndex].totalPoint += uScore.totalPoint)
            : */ Number(uScore.totalPoint.toFixed(1)),
        seatIndex: uScore.seatIndex,
      };

    });

    logger.info('userScores :==>> ', userScores);

    roundScoreWinner.push({
      title: element.title,
      score: userScores,
    });
  });

  const sendObject = {
    total: userScoreTotal,
    scores: roundScoreWinner,
    users: userDetailInScore,
  };

  return sendObject;
}

const exportObject = {
  formatCollectBootValue,
  formatCardDistribution,
  formatGameTableInfo,
  formatJoinTableInfo,
  formatStartUserTurn,
  formatStartUserBidTurn,
  formatRejoinTableInfo,
  getTimeDifference,
  // rearrangedSeats,
  formatSingUpInfo,
  formatUserThrowCardShow,
  formatUserBidShow,
  formatScoreData,
  formatScoreDataForWinner,
};
export = exportObject;
