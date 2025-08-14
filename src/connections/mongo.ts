import {logger} from '../main';
import {MongoClient} from 'mongodb';
import {getConfig} from '../config';

const {NODE_ENV, MONGO_SRV} = getConfig();

class MongoDB {
  public db: any;
  public url: string | null;
  public client: MongoClient | null;
  public DB_NAME: string;

  constructor() {
    this.DB_NAME = '';
    this.url = null;
    this.db = null;
    this.client = null;
  }

  // For dev: mongodb://username:password@host:port/dbname
  getUrl(
    DB_PROTO: string,
    DB_HOST: string,
    DB_PORT: string,
    DB_NAME: string,
    DB_USERNAME: string,
    DB_PASSWORD: string,
  ): string {
    if (NODE_ENV === 'PRODUCTION') {
      console.log('MONGO_SRV :>> ', MONGO_SRV);
      return MONGO_SRV;
    } else {
      return `${DB_PROTO}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    }
  }

  // Connection setup using modern MongoDB API
  async connection() {
    const {logger, DB} = await import('../main');

    if (!this.url) {
      throw new Error('MongoDB connection URL not set.');
    }

    this.client = new MongoClient(this.url);
    await this.client.connect();

    this.db = this.client.db(this.DB_NAME);
    DB.init(this.db, this.client);

    logger.info('DB Connected successfully!');

    return this.db;
  }

  async init() {
    const {DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD} = getConfig();

    this.DB_NAME = DB_NAME;
    this.url = this.getUrl(
      'mongodb',
      DB_HOST,
      DB_PORT,
      DB_NAME,
      DB_USERNAME,
      DB_PASSWORD,
    );

    logger.debug(`MongoDB URL: ${this.url}`);
    return this.connection();
  }
}

export default new MongoDB();
