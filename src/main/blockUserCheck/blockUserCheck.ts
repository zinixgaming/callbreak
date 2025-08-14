import { EMPTY, NUMERICAL, GAME_TYPE } from "../../constants";
import {
    getTableData, getUser, getRoundTableData, getTableLengthfromQueue, remTableFromQueue
} from '../gameTable/utils';
import { blockUserCheckI, userIf } from "../interface/userSignUpIf";
import { createTable, findAvaiableTable, setupRound } from "../gameTable/comman";
import redis from "../redis"
import logger from "../logger";
import { checkUserBlockStatus } from "../clientsideapi";

async function blockUserCheck(tableId: string, userData: userIf, key: string, index : number = NUMERICAL.ONE): Promise<blockUserCheckI | false> {

    //block User Check fetures
    try {
        logger.info(tableId, "Starting block user check : >> tableId :: >>", tableId, "userData :: >>", userData, "key :: >>" , key, "index ::>>", index);
        const { getConfigData: config } = global;
        const gameType = GAME_TYPE.SOLO;
        const [tableGamePlay, roundTableData] = await Promise.all([
            await getTableData(tableId),
            await getRoundTableData(tableId, NUMERICAL.ONE)
        ])
        // if (!tableGamePlay) throw new Error('Unable to get table data');
        // if (!roundTableData) throw new Error('Unable to get round table data');
        let isNewTableCreated = false;
        let tbId = tableId;

        if(!tableGamePlay || !roundTableData){

            logger.info("blockUserCheck :: Unable to get table data then after new table find");
            await remTableFromQueue(key, tableId); 
            let newTableId = await findAvaiableTable(key, index);
            logger.info(tableId, 'newTableId :=>> ', newTableId);
            if (newTableId) {
                index++;
                return await blockUserCheck(newTableId, userData, key, index);
            }
            else {

                logger.info(tableId, "CREATE TABLE ==>> call");
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
                logger.info(tableId, 'After :>> CREATE TABLE ==>>', newCreateTableId, userData);
                await setupRound({ tableId: newCreateTableId, noOfPlayer: roundTableData.noOfPlayer, roundNo: NUMERICAL.ONE });
                logger.info(tableId, "newCreateTableId :: ==>>  ", newCreateTableId);
                isNewTableCreated = true;
                tbId = newCreateTableId;

                return { tableId : tbId, isNewTableCreated};
            }
        }
        logger.info("blockUserCheck :: tableGamePlay  ::=>>" , tableGamePlay);
        logger.info("blockUserCheck :: roundTableData  ::=>>" , roundTableData);

        const { seats } = roundTableData;
        let blockUserKey = `blockUserCheck:${userData.lobbyId}`;
        let activePlayerUserIdArray = <string[]>[];
        if (seats?.s0?.userId != null) { activePlayerUserIdArray.push(seats.s0.userId) };
        if (seats?.s1?.userId != null) { activePlayerUserIdArray.push(seats.s1.userId) };
        if (seats?.s2?.userId != null) { activePlayerUserIdArray.push(seats.s2.userId) };
        if (seats?.s3?.userId != null) { activePlayerUserIdArray.push(seats.s3.userId) };

        logger.info(tableId, "activePlayerUserIdArray ::>>", activePlayerUserIdArray);

        if (activePlayerUserIdArray.length != NUMERICAL.ZERO) {
            let isUserBlock = await checkUserBlockStatus(activePlayerUserIdArray, userData.authToken, userData.socketId, tableId);
            logger.info(tableId, "isUserBlock ::>>>>", isUserBlock);
            
            if (isUserBlock) {

                    let newTableId = await findAvaiableTable(key, index);
                    logger.info(tableId, 'newTableId :=>> ', newTableId);
                    if (newTableId) {
                        index++;
                        return await blockUserCheck(newTableId, userData, key, index);
                    }
                    else {
                        logger.info(tableId, "CREATE TABLE ==>> call");
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
                        logger.info(tableId, 'After :>> CREATE TABLE ==>>>', newCreateTableId, userData);
                        await setupRound({ tableId: newCreateTableId, noOfPlayer: roundTableData.noOfPlayer, roundNo: NUMERICAL.ONE });
                        logger.info(tableId, "newCreateTableId :: ==>>  ", newCreateTableId);
                        isNewTableCreated = true;
                        tbId = newCreateTableId;
                    }
                

            }
            else {
                logger.info(tableId, "not a blocking user");
            }

        }
        logger.info("tbId of From =>", tbId);
        return { tableId : tbId, isNewTableCreated};

    } catch (error: any) {
        logger.info(tableId, " blockUserCheck() :: ERROR ==>>", error);
        return false;
    }

}


export = blockUserCheck;




