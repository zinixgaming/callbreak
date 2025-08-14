import logger from "../logger";
import Errors from "../errors";
import { setUser, getUser } from "../gameTable/utils";
import {
  EVENTS,
  NUMERICAL,
} from "../../constants";
import socketAck from '../../socketAck';
import { gameTableInfoRequestIf } from "../interface/requestIf";
import {userIf} from '../interface/userSignUpIf'
import Validator from '../Validator'

async function gameTableInfo(
  data: gameTableInfoRequestIf,
  socket: any,
  ack?: Function
) {
  const { tableId } = socket.eventMetaData;
  try {
    logger.debug(tableId, "gameTableInfo :: ", data)
    const { userId } = data;
    
    const getUserDetail : userIf = await getUser(userId);
    logger.info(tableId, "gameTableInfo : getUserDetail :: ", getUserDetail)
    const gameTableInfoData = {
        entryFee : getUserDetail.entryFee,
        rake: getUserDetail.rake,
        nmberOfRounds: getUserDetail.totalRound,
        numberOfPlayer: getUserDetail.noOfPlayer,
        numberOfCard: NUMERICAL.THIRTEEN
    };
    logger.info(tableId, "data : gameTableInfoData :: ", gameTableInfoData);

    // const formatGti = await Validator.responseValidator.formatGtiValidator(gameTableInfoData)
    if (ack) {
      socketAck.ackMid(
        EVENTS.GTI_INFO_SOCKET_EVENT,
        {
          success: true,
          error: null,
          data: gameTableInfoData,
        },
        data.userId,
        tableId,
        ack,
      );
    }

  } catch (error) {
    logger.error(tableId, "CATCH_ERROR : gameTableInfo :: ", data, "-", error);
  }
}

export = gameTableInfo