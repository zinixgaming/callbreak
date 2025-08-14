require('./commonEventHandlers/socket');

import Redis from './redis';
import logger from './logger';
import DB from './db';
import requestHandler from './requestHandler';
import CommonEventEmitter from './commonEventEmitter';
import encryptData from './encDec/encryption';
import decryptData from './encDec/decryption';

const exportObject = {
  Redis,
  logger,
  DB,
  requestHandler,
  CommonEventEmitter,
  encryptData,
  decryptData,
};
export = exportObject;
