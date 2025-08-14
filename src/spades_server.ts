
(async () => {
  const config = await import('./config');

  const { logger } = await import('./main');

  const { socketOps, httpServer, rdsOps, mongo } = await import(
    './connections'
  );

  const { getConfig } = config;

  (async () => {
    try {
      const promise = await Promise.all([
        // mongo.init(),
        rdsOps.init(),
        socketOps.createSocketServer(),
      ]);

      const { client: redisClient }: any = promise[0];
      const socketClient: any = promise[1];
      const redlock = await rdsOps.initRedlock(redisClient);

      global.redisClient = redisClient;
      global.socketClient = socketClient;
      global.getConfigData = getConfig();
      global.getLock = redlock;
      global.callGRPC = false;
      global.isLoganable = true;

      console.log('get Config Data :==>> ', getConfig());

      const {
        getConfigData: { SERVER_TYPE, HTTP_SERVER_PORT },
      } = global;

      console.log('HTTP_SERVER_PORT :=>> ', HTTP_SERVER_PORT);

      httpServer.listen(HTTP_SERVER_PORT, () => {
        logger.info(
          `${SERVER_TYPE} Server listening to the port ${HTTP_SERVER_PORT}`,
        );
      });

      // socketOps.logging();
    } catch (error) {
      console.trace(error);

      logger.error(`Server listen error ${error}`);
    }
  })();

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
    .on('uncaughtException', (err) => {
      logger.error('Uncaught Exception thrown', new Date(), ' >> ', '\n', err);
    });
})();
