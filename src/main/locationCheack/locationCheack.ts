import disctanceCalculation from "./disctanceCalculation";
import { EMPTY, NUMERICAL, GAME_TYPE } from "../../constants";
import {
    getTableData, getUser, getRoundTableData, getTableLengthfromQueue, remTableFromQueue
} from '../gameTable/utils';
import { userIf } from "../interface/userSignUpIf";
import { createTable, findAvaiableTable, setupRound } from "../gameTable/comman";
import redis from "../redis"
import logger from "../logger";



async function locationDistanceCheck(tableId: string, userData: userIf, key: string, rediusRange: number, index : number = NUMERICAL.ONE): Promise<string> {

    const { getConfigData: config } = global;
    const gameType = GAME_TYPE.SOLO;

    //location fetures
    try {

        const [tableGamePlay, roundTableData] = await Promise.all([
            await getTableData(tableId),
            await getRoundTableData(tableId, NUMERICAL.ONE)
        ])
        if (!tableGamePlay) throw new Error('Unable to get table data');
        if (!roundTableData) throw new Error('Unable to get round table data');
        let tbId = tableId;

        if(!tableGamePlay || !roundTableData){

            logger.info("locationDistanceCheck :: Unable to get table data then after new table find");
            await remTableFromQueue(key, tableId); 
            let newTableId = await findAvaiableTable(key, index);
            logger.info(tableId, 'newTableId :====>> ', newTableId);
            if (newTableId) {
                index++;
                return await locationDistanceCheck(newTableId, userData, key, rediusRange, index);
            }
            else {
                logger.info(tableId, "==== locationDistanceCheck :: CREATE TABLE ====");
                let newCreateTableId = await createTable({
                    gameType,
                    lobbyId: userData.lobbyId,
                    gameId: userData.gameId,
                    winningScores: config.WINNING_SCORES
                        ? config.WINNING_SCORES
                        : [-100, 50],
                    gameStartTimer: userData.gameStartTimer,
                    userTurnTimer: userData.userTurnTimer,
                    bootValue: userData.entryFee,
                    isFTUE: userData.isFTUE,
                    totalRounds: userData.totalRound,
                    winningAmount: userData.winningAmount,
                    isUseBot: userData.isUseBot
                });
                logger.info(tableId, 'After :>> == CREATE TABLE ==>', newCreateTableId, userData);
                await setupRound({ tableId: newCreateTableId, noOfPlayer: roundTableData.noOfPlayer, roundNo: NUMERICAL.ONE });
                logger.info(tableId, "newCreateTableId 123 ::> ", newCreateTableId);
                tbId = newCreateTableId;
                return tbId;
            }
        }

        const { latitude, longitude } = userData;
        const { seats } = roundTableData;
        let activePlayerUserIdArray = <string[]>[];
        if (seats?.s0?.userId != null) { activePlayerUserIdArray.push(seats.s0.userId) };
        if (seats?.s1?.userId != null) { activePlayerUserIdArray.push(seats.s1.userId) };
        if (seats?.s2?.userId != null) { activePlayerUserIdArray.push(seats.s2.userId) };
        if (seats?.s3?.userId != null) { activePlayerUserIdArray.push(seats.s3.userId) };

        logger.info(tableId, "activePlayerUserIdArray :: ", activePlayerUserIdArray);

        let locationKey = `LocationCheck:${userData.lobbyId}`;
        if (activePlayerUserIdArray.length >= NUMERICAL.ONE) {

            for (let i = 0; i < activePlayerUserIdArray.length; i++) {
                const ele = activePlayerUserIdArray[i];
                logger.info(tableId, "length ", activePlayerUserIdArray.length);

                const getUserData = await getUser(ele.toString());
                if (!getUserData) throw new Error('Unable to get user data')

                let distanceFind: number = disctanceCalculation(Number(latitude), Number(longitude), Number(getUserData.latitude), Number(getUserData.longitude));
                logger.info(tableId, "distanceFind ::>>> ", distanceFind);

                let rangeRediusCheck = rediusRange;
                logger.info(tableId, 'range :=>>> ', rangeRediusCheck);

                if (distanceFind < rangeRediusCheck) {

                        let newTableId = await findAvaiableTable(key, index);
                        logger.info(tableId, 'newTableId ::==>> ', newTableId);
                        if (newTableId) {
                            index++;
                            return await locationDistanceCheck(newTableId, userData, key, rediusRange, index);
                        }
                        else {
                            logger.info(tableId, "=== locationDistanceCheck :: CREATE TABLE ===");
                            let newCreateTableId = await createTable({
                                gameType,
                                lobbyId: userData.lobbyId,
                                gameId: userData.gameId,
                                winningScores: config.WINNING_SCORES
                                    ? config.WINNING_SCORES
                                    : [-100, 50],
                                gameStartTimer: userData.gameStartTimer,
                                userTurnTimer: userData.userTurnTimer,
                                bootValue: userData.entryFee,
                                isFTUE: userData.isFTUE,
                                totalRounds: userData.totalRound,
                                winningAmount: userData.winningAmount,
                                isUseBot: userData.isUseBot
                            });
                            logger.info(tableId, 'After :>> == CREATE TABLE ==>>', newCreateTableId, userData);
                            await setupRound({ tableId: newCreateTableId, noOfPlayer: roundTableData.noOfPlayer, roundNo: NUMERICAL.ONE });
                            logger.info(tableId, "newCreateTableId 123 ::> ", newCreateTableId);
                            tbId = newCreateTableId;
                        }
                }
                else {
                    logger.info(tableId, "distanceFind vaild seating for table");
                }
                logger.info("tbId of From 2", tbId);
                tbId = tbId;
            }
        }
        logger.info(tableId, "tbId of From", tbId);
        return tbId;

    } catch (error: any) {
        logger.info(tableId, "== locationDistanceCheck() :: ERROR ==>>", error);
        return error
    }

}


export = locationDistanceCheck;




