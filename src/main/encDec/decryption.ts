const crypto = require('crypto');
import logger from '../logger';

function decryptData(request: any) {
  /* +-------------------------------------------------------------------+
            desc: this function decrypt the data.
            i/p: encrypted data
            o/p: decrypted data
        +-------------------------------------------------------------------+ */
  const encKey = 'DFK8s58uWFCF4Vs8NCrgTxfMLwjL9WUy';

  const keyBuf = Buffer.from(Array(32));
  keyBuf.write(encKey, 'utf8');
  const ivBuf = Buffer.from(Array(16));
  const deCipher = crypto.createDecipheriv('aes256', keyBuf, ivBuf);
  let decrypted;
  try {
    decrypted =
      deCipher.update(request, 'base64', 'utf8') + deCipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (e) {
    logger.error(e);
    return null;
  }
}

export = decryptData;
