import { NUMERICAL } from "../../constants";
import { playerPlayingDataIf } from "../interface/playerPlayingTableIf";
import { defaultPlayingTableIf } from "../interface/playingTableIf";
import { setupRoundIf } from "../interface/startRoundIf";
import { userIf } from "../interface/userSignUpIf";
import logger from "../logger";
import Validator from "../Validator";
import { getRoundTableData, getTableValueFromIndexFromQueue, popTableFromQueue, setPlayerGamePlay, setRoundTableData, setTableData } from "./utils";
import DefaultDataGenerator from "../defaultData";

// for creating new table
const createTable = async (data: defaultPlayingTableIf) => {
    try {
        data = await Validator.methodValidator.createTableValidator(data);
        const tableData = DefaultDataGenerator.defaultTableData(data);

        return setTableData(tableData);
    } catch (error) {
        logger.error("CATCH_ERROR : createTable :: ", data, error);
        throw error;
    }
};

// for finding available table
const findAvaiableTable = async (queueKey: string, index: number = NUMERICAL.ZERO) => {

    const tableId: string | null = await getTableValueFromIndexFromQueue(queueKey, index);
    console.log('tableId :>>> ', tableId);
    // const tableId: string | null = await popTableFromQueue(queueKey);
    return tableId;
};

// for creating and inserting playergameplay data
const insertPlayerGamePlayData = async (
    userData: userIf,
    roundTableId: string,
    seatIndex: number
) => {
    const playerGamePlayData: playerPlayingDataIf =
        DefaultDataGenerator.defaultPlayerGamePlayData({
            roundTableId,
            seatIndex,
            ...userData,
        });

    setPlayerGamePlay(
        userData.userId,
        playerGamePlayData.roundTableId,
        playerGamePlayData
    );
};

const insertPlayerInTable = async (userData: userIf, tableId: string) => {
    const tableData = await getRoundTableData(tableId, NUMERICAL.ONE);

    let seatIndex: number = -1;
    if (tableData != null) {
        for (let i = 0; i < 4; i++) {
            const key = `s${i}`;
            const seat = tableData.seats[`s${i}`];
            logger.info(tableId, 
                "add user Data in table : userData :: ",
                userData,
                "Object.keys(seat).length : userData :: ",
                Object.keys(seat).length
            );

            if (Object.keys(seat).length === 0) {
                // inserting player in seat
                tableData.seats[key]._id = userData._id;
                tableData.seats[key].userId = userData.userId;
                tableData.seats[key].username = userData.username;
                tableData.seats[key].profilePicture = userData.profilePicture;
                tableData.seats[key].seatIndex = i;

                tableData.totalPlayers += 1;

                seatIndex = i;

                break;
            } else {
                if (tableData.seats[key].userId === userData.userId) {
                    seatIndex = i;

                    break;
                }
            }
        }
    }
    if (seatIndex != -1) {
        logger.info(tableId, "add user Data in table : tableData :: ", tableData);
        await setRoundTableData(tableId, NUMERICAL.ONE, tableData);

        insertPlayerGamePlayData(userData, tableId, seatIndex);
    }

    return seatIndex;
};

const setupRound = async ({ tableId, noOfPlayer, roundNo }: setupRoundIf) => {
    // create round one table
    logger.info(tableId, 'tableId ===:>> ', tableId, noOfPlayer, roundNo);
    const roundOneTableData = await DefaultDataGenerator.defaultRoundTableData({
        tableId,
        noOfPlayer,
        currantRound : roundNo
    });
    logger.info(tableId, 'roundOneTableData :>> ', roundOneTableData);
    setRoundTableData(tableId, roundNo, roundOneTableData);
};

const exportObject = {
    createTable,
    findAvaiableTable,
    insertPlayerGamePlayData,
    insertPlayerInTable,
    setupRound
  };
  export = exportObject;