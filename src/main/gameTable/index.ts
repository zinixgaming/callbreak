import logger from '../logger';
import CommonEventEmitter from '../commonEventEmitter';
import {
  NUMERICAL,
  EVENTS,
  TABLE_STATE,
  GAME_TYPE,
  MESSAGES,
  REDIS,
} from '../../constants';
import Scheduler from '../scheduler';
import {
  setTableData,
  setRoundTableData,
  setPlayerGamePlay,
  getTableData,
  getRoundTableData,
  pushTableInQueue,
  popTableFromQueue,
  setRejoinTableHistory,
  getPlayerGamePlay,
  setCounterIntialValueLobby,
  getOnliPlayerCountLobbyWise,
  incrCounterLobbyWise,
  getUser,
  setUser,
  remTableFromQueue,
} from './utils';
import rejoinTable from '../play/rejoinTable/rejoinTable';
import {
  formatGameTableInfo,
  formatJoinTableInfo,
  formatSingUpInfo,
} from '../play/helpers/playHelper';
import {blockUserCheckI, userIf} from '../interface/userSignUpIf';
import {defaultPlayingTableIf} from '../interface/playingTableIf';
import {playerPlayingDataIf} from '../interface/playerPlayingTableIf';
import socketAck from '../../socketAck';
import Validator from '../Validator';
import Errors from '../errors';
import {setupRoundIf} from '../interface/startRoundIf';
import cancelBattle from '../play/cancelBattle';
// import { signUpForBot } from "../FTUE";
import redis from '../redis';
import locationDistanceCheck from '../locationCheack/locationCheack';
import {
  createTable,
  findAvaiableTable,
  insertPlayerInTable,
  setupRound,
} from './comman';
import {addGameRunningStatus, rediusCheck} from '../clientsideapi';
import {rediusCheckDataRes} from '../interface/cmgApiIf';
import {blockUserCheck} from '../blockUserCheck';

// for insert new signed up player in table
const insertNewPlayer = async (
  userData: userIf,
  socket: any,
  ack?: (response: any) => void,
) => {
  const socketId = socket.id;
  const {getLock, getConfigData: config} = global;
  const {
    gameId,
    lobbyId,
    totalRound,
    _id,
    fromBack,
    userId,
    entryFee,
    isFTUE,
    winningAmount,
    noOfPlayer,
    isUseBot,
  } = userData;
  const gameType = GAME_TYPE.SOLO;
  const queueKey = `${gameType}:${lobbyId}`;
  // set lock;
  const findTableLock = await getLock.acquire([queueKey], 2000);

  try {
    const createOrJoinTable: boolean = await rejoinTable(
      userData,
      true,
      socket,
      ack,
    );
    logger.info(userId, `createOrJoinTable :::>> `, createOrJoinTable);
    if (createOrJoinTable) {
      let tableId = await findAvaiableTable(queueKey);
      logger.info(userId, 'insertNewPlayer ::: before tableId ::: ', tableId);
      if (!ack) {
        tableId = socket.tableId;
      }
      logger.info(userId, 'insertNewPlayer ::: after tableId ::: ', tableId);
      if (!tableId) {
        // create new table
        tableId = await createTable({
          gameType,
          lobbyId,
          gameId,
          winningScores: config.WINNING_SCORES
            ? config.WINNING_SCORES
            : [-100, 50],
          gameStartTimer: userData.gameStartTimer,
          userTurnTimer: userData.userTurnTimer,
          bootValue: entryFee,
          isFTUE,
          totalRounds: userData.totalRound,
          winningAmount,
          isUseBot,
        });

        await setupRound({tableId, noOfPlayer, roundNo: NUMERICAL.ONE});
      } else {
        // blocking user check
        const blockUserData = (await blockUserCheck(
          tableId,
          userData,
          queueKey,
        )) as blockUserCheckI;
        if (!blockUserData) throw new Error(`Could not block user`);

        logger.info(userId, `blockUserData :: >>`, blockUserData);
        tableId = blockUserData.tableId;

        if (!blockUserData.isNewTableCreated) {
          //redius check
          const rediusCheckData: rediusCheckDataRes = await rediusCheck(
            gameId,
            userData.authToken,
            socketId,
            tableId,
          );
          logger.info('userData.isUseBot  ==>>>', userData.isUseBot);
          if (rediusCheckData) {
            const rangeRediusCheck: number = parseFloat(
              rediusCheckData.LocationRange,
            );
            if (
              rediusCheckData &&
              rediusCheckData.isGameRadiusLocationOn &&
              rangeRediusCheck != NUMERICAL.ZERO &&
              userData.isUseBot == false
            ) {
              logger.info(
                'locationDistanceCheck ===>> before',
                tableId,
                rangeRediusCheck,
              );
              tableId = await locationDistanceCheck(
                tableId,
                userData,
                queueKey,
                rangeRediusCheck,
              );
            }
          }
        }
      }
      logger.info(userId, 'tableId  ===>>> ', tableId);

      // inserting player in table
      const seatIndex: number | null = await insertPlayerInTable(
        userData,
        tableId,
      );
      logger.info(
        userId,
        'insertNewPlayer : seatIndex -- ',
        seatIndex,
        `tableId: ${tableId} :: userId:${userId}`,
      );

      // get updated table value
      const tableData = await getTableData(tableId);
      const roundTableData = await getRoundTableData(tableId, NUMERICAL.ONE);
      const userProfile: userIf = await getUser(userId);

      if (ack) {
        const eventSignUpData = await formatSingUpInfo(userData);
        const eventGTIdata = await formatGameTableInfo(
          tableData,
          roundTableData,
          {
            seatIndex,
          },
        );

        const getOnlinePlayerCountLobbyWise = await getOnliPlayerCountLobbyWise(
          REDIS.ONLINE_PLAYER_LOBBY,
          lobbyId,
        );

        if (!getOnlinePlayerCountLobbyWise) {
          await setCounterIntialValueLobby(REDIS.ONLINE_PLAYER_LOBBY, lobbyId);
        }
        // for lobby wise online users
        const countLobbyWise = await incrCounterLobbyWise(
          REDIS.ONLINE_PLAYER_LOBBY,
          lobbyId,
        );
        logger.info(userId, 'insertNewPlayer :count :: ', countLobbyWise);

        // send (signUp And Get Table Info)both event data in signUp
        socketAck.ackMid(
          EVENTS.SIGN_UP_SOCKET_EVENT,
          {
            SIGNUP: eventSignUpData,
            GAME_TABLE_INFO: eventGTIdata,
          },
          // socket.metrics,
          socket.userId,
          tableId,
          ack,
        );
      }
      const eventJoinTableData = await formatJoinTableInfo(
        seatIndex,
        roundTableData,
      );
      // const playerGamePlay = await getPlayerGamePlay(userData.userId, tableId);

      // send JOIN_TABLE event
      CommonEventEmitter.emit(EVENTS.JOIN_TABLE_SOCKET_EVENT, {
        tableId,
        data: eventJoinTableData,
      });

      // join socket in socket room
      CommonEventEmitter.emit(EVENTS.ADD_PLAYER_IN_TABLE_ROOM, {
        socket,
        data: {tableId},
      });

      socket.eventMetaData = {
        userId: roundTableData.seats[`s${seatIndex}`].userId,
        userObjectId: roundTableData.seats[`s${seatIndex}`]._id,
        tableId,
        roundId: roundTableData._id,
        currentRound: tableData.currentRound,
      };

      //add Game Running Status
      const apiData = {
        tableId,
        tournamentId: userProfile.lobbyId,
        gameId: userProfile.gameId,
      };
      const addGameRunningDetail = await addGameRunningStatus(
        apiData,
        userProfile.authToken,
        userProfile.socketId,
        userProfile.userId,
      );

      userProfile.tableId = tableId;
      await setUser(userId, userProfile);

      if (!isFTUE) {
        await setRejoinTableHistory(
          roundTableData.seats[`s${seatIndex}`].userId,
          gameId,
          lobbyId,
          {
            userId: roundTableData.seats[`s${seatIndex}`].userId,
            tableId,
            isEndGame: false,
          },
        );
      }
      if (Number(roundTableData.noOfPlayer) > NUMERICAL.ONE) {
        if (roundTableData.totalPlayers !== Number(roundTableData.noOfPlayer)) {
          // push table in the Queue if FTUE is true to add bot
          logger.info(
            userId,
            'insertNewPlayer : pushTableInQueue :: tableId :: ',
            tableId,
            isFTUE,
          );

          if (roundTableData.totalPlayers == NUMERICAL.ONE) {
            await pushTableInQueue(queueKey, tableId);
          }

          await Scheduler.addJob.findBotTimer({
            jobId: queueKey,
            timer: NUMERICAL.FIVE * NUMERICAL.THOUSAND,
            tableId,
            gameConfig: {
              lobbyId,
              gameId,
              gameStartTimer: userData.gameStartTimer,
              userTurnTimer: userData.userTurnTimer,
              entryFee: userData.entryFee,
              totalRound: userData.totalRound,
              minPlayer: userData.minPlayer,
              noOfPlayer,
              winningAmount,
              isUseBot,
              userAuthToken: userData.authToken,
              moneyMode: userData.moneyMode,
            },
          });
        } else if (
          roundTableData.totalPlayers === Number(roundTableData.noOfPlayer)
        ) {
          // table is full
          const data = {
            timer: tableData.gameStartTimer,
          };

          if (!isFTUE) {
            CommonEventEmitter.emit(EVENTS.ROUND_TIMER_STARTED_SOCKET_EVENT, {
              tableId,
              data,
            });
            logger.info(
              userId,
              'insertNewPlayer : gameStartTimer :::: ',
              tableData.gameStartTimer,
              `tableId: ${tableId} :: userId:${userId}`,
            );
            await Scheduler.addJob.initializeGameplay({
              timer:
                (tableData.gameStartTimer - NUMERICAL.SIX) * NUMERICAL.THOUSAND,
              queueKey,
              tableId,
              tableData,
              roundTableData,
            });
          } else {
            await Scheduler.addJob.initializeGameplay({
              timer: NUMERICAL.ONE * NUMERICAL.THOUSAND,
              queueKey,
              tableId,
              tableData,
              roundTableData,
            });
          }

          roundTableData.tableState = TABLE_STATE.ROUND_TIMER_STARTED;
          const currentTime = new Date();
          roundTableData.tableCurrentTimer = Number(new Date());
          roundTableData.updatedAt = new Date();

          // await popTableFromQueue(queueKey);
          logger.info(userId, ' remTableFromQueue :>> queueKey :: ', queueKey);
          await remTableFromQueue(queueKey, tableId);

          await setRoundTableData(tableId, NUMERICAL.ONE, roundTableData);
        }
      } else {
        throw new Errors.InvalidInput(
          'number of player require more then one!',
        );
      }
    } else {
      logger.info(
        userId,
        'insertNewPlayer : rejoinTableOnKillApp :: get false :',
      );
      // await getLock.release(findTableLock);
    }
  } catch (error) {
    logger.error(
      userId,
      'CATCH_ERROR : insertNewPlayer :: ',
      userId,
      _id,
      queueKey,
      error,
    );

    if (error instanceof Errors.CancelBattle) {
      await cancelBattle({
        // @ts-expect-error - tableId is used in cancelBattle function
        tableId,
        errorMessage: error,
      });
    } else if (error instanceof Errors.InsufficientFundError) {
      const nonProdMsg = 'Insufficient Balance!';
      CommonEventEmitter.emit(EVENTS.SHOW_POPUP, {
        socket,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: MESSAGES.ERROR.INSUFFICIENT_BALANCE,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else {
      socketAck.ackMid(
        EVENTS.SIGN_UP_SOCKET_EVENT,
        {
          success: false,
          error: {
            errorCode: 500,
            errorMessage: MESSAGES.ERROR.COMMON_ERROR,
          },
        },
        // socket.metrics,
        socket.userId,
        _id,
        ack,
      );
    }
  } finally {
    await getLock.release(findTableLock);
  }
};

const exportObject = {
  insertNewPlayer,
};
export = exportObject;
