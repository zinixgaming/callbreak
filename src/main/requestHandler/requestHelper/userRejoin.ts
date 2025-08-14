import logger from '../../logger';
import userRejoin from '../../signUp/userRejoin';
import {PLAYER_STATE} from '../../../constants';
import {userRejoinHelperRequestIf} from '../../interface/requestIf';
import Validator from '../../Validator';

async function userRejoinHelper(
  {data: userData}: userRejoinHelperRequestIf,
  socket: any,
  ack?: (response: any) => void,
) {
  const {eventMetaData}: any = socket;
  try {
    logger.debug(eventMetaData.tableId, 'call userRejoinHelper :: ', userData);
    userData = await Validator.requestValidator.userRejoinValidator(userData);
    const data = {
      fromBack: true,
      ...userData,
    };
    return userRejoin(data, socket, ack).catch((e: any) => logger.error(e));
  } catch (error) {
    logger.error(
      eventMetaData.tableId,
      `CATCH_ERROR : userRejoinHelper :: userId: ${eventMetaData.userId} :: tableId: ${eventMetaData.tableId} :: `,
      userData,
      error,
    );
  }
}

export = userRejoinHelper;
