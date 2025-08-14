const { ObjectID } = require("mongodb");
import { EMPTY, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../../constants";
import { userIf, userSignUpIf } from "../interface/userSignUpIf";
import { defaultPlayingTableIf } from "../interface/playingTableIf";
import { defaultRoundTableIf, userSeatsIf } from "../interface/roundTableIf";
import {
  defaultPlayerTableIf,
  playerPlayingDataIf,
} from "../interface/playerPlayingTableIf";

function defaultUserData(signUpData: userIf) {
  // generates the user default fields for the game
  const currentTimestamp = new Date();

  const data = {
    _id: ObjectID().toString(),
    isFTUE: signUpData.isFTUE,
    username: signUpData.username,
    deviceId: signUpData.deviceId,
    lobbyId: signUpData.lobbyId.toString(),
    gameId: signUpData.gameId,
    startTime: signUpData.startTime,
    balance: signUpData.balance,
    userId: signUpData.userId,
    tableId : EMPTY,
    profilePicture: signUpData.profilePicture,
    totalRound: signUpData.totalRound,
    minPlayer: signUpData.minPlayer,
    noOfPlayer: signUpData.noOfPlayer,
    winningAmount: signUpData.winningAmount,
    rake: signUpData.rake,
    gameStartTimer: signUpData.gameStartTimer,
    userTurnTimer: signUpData.userTurnTimer,
    entryFee: signUpData.entryFee,
    authToken: signUpData.authToken,
    longitude: signUpData.longitude,
    latitude:signUpData.latitude,
    fromBack: signUpData.fromBack,
    isUseBot : signUpData.isUseBot,
    isBot : signUpData.isBot,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
    socketId: signUpData.socketId,
    moneyMode : signUpData.moneyMode,
    isAnyRunningGame : signUpData.isAnyRunningGame || false,
  };
  return data;
}

// generates the Playing Table default fields for the game Play
const defaultTableData = (data: defaultPlayingTableIf) => {
  const currentTimestamp = new Date();

  return {
    _id: ObjectID().toString(),
    gameType: data.gameType,
    totalRounds: data.totalRounds,
    currentRound: NUMERICAL.ONE,
    lobbyId: data.lobbyId.toString(),
    gameId: data.gameId,
    isUseBot : data.isUseBot,
    winningScores: data.winningScores,
    gameStartTimer: data.gameStartTimer,
    userTurnTimer: data.userTurnTimer,
    bootValue: data.bootValue,
    potValue: data.bootValue * NUMERICAL.FOUR,
    winningAmount : data.winningAmount,
    winner: [],
    isFTUE: data.isFTUE,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
  };
};
interface se {
  s0?: {};
  s1: {};
  s2: {};
  s3: {};
}
const createSeats = async (seat: number): Promise<userSeatsIf> => {
  const seats: any = {};
  // for await (let i = 0; i < seat; i++) {
  //   seats[`s${i}`] = {};
  // }
  // return seats;

  interface asyncIterableIf {
    value?: number | undefined;
    done: boolean;
  }

  const asyncIterable = {
    [Symbol.asyncIterator]() {
      let i = 0;
      return {
        next(): Promise<asyncIterableIf> {
          const done = i === seat;
          const value = done ? undefined : i++;
          return Promise.resolve({ value, done });
        },
        return(): asyncIterableIf {
          // This will be reached if the consumer called 'break' or 'return' early in the loop.
          return { done: true };
        },
      };
    },
  };

  for await (const num of asyncIterable) {
    console.log(num);
    seats[`s${num}`] = {};
  }
  console.log(`createSeats : seats :::: ${seats}`);

  return seats;
};

// generates the Playing Round Table default fields for the game Play
const defaultRoundTableData = async (data: defaultRoundTableIf) => {
  const currentTimestamp = new Date();

  return {
    _id: ObjectID().toString(),
    tableId: data.tableId,
    tableState: TABLE_STATE.WAITING_FOR_PLAYERS,
    tableCurrentTimer: null,
    totalPlayers: NUMERICAL.ZERO,
    // noOfPlayer: NUMERICAL.FOUR,
    noOfPlayer: data.noOfPlayer,
    currentRound: data.currantRound || NUMERICAL.ONE,
    totalHands: NUMERICAL.THIRTEEN,
    // seats: { s0: {}, s1: {}, s2: {}, s3: {} },
    seats: await createSeats(Number(data.noOfPlayer)),
    turnCurrentCards: ["U-0", "U-0", "U-0", "U-0"],
    turnCardSequence: "N",
    lastInitiater: null,
    dealerPlayer: null,
    breakingSpades: false,
    hands: [],
    turnCount: 0,
    handCount: 0,
    currentTurn: null,
    isTieRound: false,
    currentTieRound: 0,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
  };
};

// generates the Playing Player Table default fields for the game Play
const defaultPlayerGamePlayData = (
  data: defaultPlayerTableIf | playerPlayingDataIf
) => {
  const currentTimestamp = new Date();

  return {
    _id: ObjectID().toString(),
    userObjectId: data._id,
    userId: data.userId,
    username: data.username,
    profilePicture: data.profilePicture,
    roundTableId: data.roundTableId,
    seatIndex: data.seatIndex,
    userStatus: PLAYER_STATE.PLAYING,
    isFirstTurn: false,
    socketId: data.socketId,
    currentCards: [],
    turnTimeout: 0,
    bid: 0,
    bidTurn: false,
    hands: 0,
    bags: 0,
    point: 0,
    isLeft: false,
    isAuto: false,
    isTurn: false,
    isBot : data.isBot,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
    roundCards : []
  };
};

const exportObject = {
  defaultUserData,
  defaultTableData,
  defaultRoundTableData,
  defaultPlayerGamePlayData,
};
export = exportObject;
