// import logger from "../../logger";
// import UserProfile from "../../signUp";
// import { NUMERICAL } from "../../../constants";
// import { botSignUpIf } from "../../interface/FTUEIf";
// import { getRandomNumber } from "../common";

// async function signUpForBot(gameConfig: botSignUpIf, socket: any) {
//   try {
//     const data = {
//       _id: "",
//       isFTUE: true,
//       username: `opponent${gameConfig.seatIndex}`,
//       deviceId: "",
//       fromBack: false,
//       lobbyId: gameConfig.lobbyId,
//       gameId: gameConfig.gameId,
//       startTime: NUMERICAL.ZERO,
//       balance: gameConfig.balance,
//       userId: getRandomNumber(111111111, 999999999).toString(),
//       profilePicture: "botPic",
//       totalRound: gameConfig.totalRound,
//       minPlayer: gameConfig.minPlayer,
//       noOfPlayer: gameConfig.noOfPlayer,
//       isUseBot: true,
//       moneyMode: gameConfig.moneyMode,
//       rake: gameConfig.rake,
//       winningAmount: gameConfig.winningAmount,
//       // profilePic: gameConfig.profilePic,
//       numberOfCard: gameConfig.numberOfCard,
//       gameStartTimer: gameConfig.gameStartTimer,
//       longitude: gameConfig.longitude,
//       latitude: gameConfig.latitude,
//       userTurnTimer: gameConfig.userTurnTimer,
//       entryFee: gameConfig.entryFee,
//       authToken: "nbbbbb",
//     };

//     return UserProfile.userSignUp(data, socket).catch((e: any) =>
//       logger.error(e)
//     );
//   } catch (error: any) {
//     logger.error("CATCH_ERROR : signUpForBot :", gameConfig, error);
//   }
// }

// export = signUpForBot;
