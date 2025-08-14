import CryptoJS from 'crypto-js';
import {getConfig} from '../../../config';

const {SECRET_KEY} = getConfig();

async function auth(authKey: string): Promise<{
  status: number;
  message: string;
  data: string | null;
}> {
  try {
    console.log('authKey :>> ', authKey, 'SECRET_KEY :: ', SECRET_KEY);

    const bytes = CryptoJS.AES.decrypt(authKey, SECRET_KEY);
    const gameId = bytes.toString(CryptoJS.enc.Utf8);

    console.log('gameId ::>> ', gameId);

    if (!gameId) {
      return {
        status: 400,
        message: 'oops ! Something went wrong',
        data: null,
      };
    }

    return {
      status: 200,
      message: 'data fetched',
      data: gameId,
    };
  } catch (error) {
    console.error('auth :>> ', error);
    return {
      status: 500,
      message: 'internal error',
      data: null,
    };
  }
}

export = auth;
