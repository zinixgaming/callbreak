import logger from '../../logger';
import { PREFIX } from '../../../constants/redis';
import { rejoinIf } from '../../interface/userSignUpIf';
import rejoinTable from '../../play/rejoinTable/rejoinTable';
import REDIS from '../../redis';

const userRejoin = async (data: rejoinIf, socket: any, ack?: Function) => {
  const { userId } = data;

  const keyForUser = `${PREFIX.USER}:${userId}`;
  let userInfo = await REDIS.commands.getValueFromKey(keyForUser);

  userInfo = { ...userInfo, ...data, fromBack: true };

  logger.info(userId, 
    'userRejoin : userInfo : socket.eventMetaData :: ',
    socket.eventMetaData,
    'userRejoin : userInfo :: ',
    userInfo,
  );

  await rejoinTable(userInfo, true, socket, ack);
};
export = userRejoin;
