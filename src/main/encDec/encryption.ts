const crypto = require('crypto');

const encryptData = (toCrypt: any) => {
  /* +-------------------------------------------------------------------+
        desc: this function encrypt the data.
        i/p: plain data
        o/p: encrypted data
    +-------------------------------------------------------------------+ */
  const encKey = 'DFK8s58uWFCF4Vs8NCrgTxfMLwjL9WUy';

  const keyBuf = Buffer.from(Array(32));
  keyBuf.write(encKey, 'utf8');
  const ivBuf = Buffer.from(Array(16));
  const cipher = crypto.createCipheriv('aes256', keyBuf, ivBuf);
  return (
    cipher.update(JSON.stringify(toCrypt), 'utf-8', 'base64') +
    cipher.final('base64')
  );
};

export = encryptData;
