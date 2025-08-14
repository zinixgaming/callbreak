import {logger} from './main';
import {getConfig} from './config';
import {socketOps, httpServer, rdsOps} from './connections';

const main = async () => {
  try {
    const promise = await Promise.all([
      rdsOps.init(),
      socketOps.createSocketServer(),
    ]);
    const {client: redisClient}: any = promise[0];
    const socketClient: any = promise[1];
    const redlock = rdsOps.initRedlock(redisClient);
    global.redisClient = redisClient;
    global.socketClient = socketClient;
    global.getConfigData = getConfig();
    global.getLock = redlock;
    global.callGRPC = false;
    global.isLoganable = true;
    // console.log('get Config Data :==>> ', getConfig());
    const {
      getConfigData: {SERVER_TYPE, HTTP_SERVER_PORT},
    } = global;
    console.log('HTTP_SERVER_PORT :=>> ', HTTP_SERVER_PORT);
    httpServer.listen(HTTP_SERVER_PORT, () => {
      logger.info(
        `${SERVER_TYPE} Server listening to the port ${HTTP_SERVER_PORT}`,
      );
    });
  } catch (error) {
    console.error(error);
    logger.error(`Server listen error ${error}`);
  }
  process
    .on('unhandledRejection', (reason, p) => {
      logger.error(
        reason,
        'Unhandled Rejection at Promise >> ',
        new Date(),
        ' >> ',
        p,
      );
    })
    .on('uncaughtException', err => {
      logger.error('Uncaught Exception thrown', new Date(), ' >> ', '\n', err);
    });
};

void main();
