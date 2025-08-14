const { MongoClient } = require("mongodb");
import { getConfig } from "../config";
const {
  NODE_ENV, 
  MONGO_SRV
} = getConfig();
class MongoDB {
  public DB_NAME: any;
  public url: any;
  public db: any;

  constructor() {
    this.DB_NAME = "";
    this.url = null;
    this.db = null;
  }
  // for dev :- ${DB_PROTO}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
  getUrl(
    DB_PROTO: string,
    DB_HOST: string,
    DB_PORT: string,
    DB_NAME: string,
    DB_USERNAME: string,
    DB_PASSWORD: string
  ) {
    if(NODE_ENV == "PRODUCTION"){
      console.log('MONGO_SRV :>> ', MONGO_SRV);
      return MONGO_SRV;
    }else{
      // return `${DB_PROTO}://${DB_HOST}:${DB_PORT}/${DB_NAME}`; //?retryWrites=true&w=majority 
      return `${DB_PROTO}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`; //?retryWrites=true&w=majority
    }
  }

  // connection setup
  async connection(resolve: any, reject: any) {
    const { logger, DB } = await import("../main");
    console.log(`this.url :: ${this.url}`);
    MongoClient.connect(
      this.url,
      { useUnifiedTopology: true, useNewUrlParser: true },
      (err: any, client: any) => {
        console.log("===> error <====", err);

        if (err) reject(err);

        this.db = client.db(this.DB_NAME);

        DB.init(this.db, client);

        logger.info("DB Connected successfully!");

        resolve(this.db);
      }
    );
  }
  async init() {
    const { logger } = await import("../main");

    const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD }: any =
      getConfig();

    this.DB_NAME = DB_NAME;
    this.url = this.getUrl(
      "mongodb",
      DB_HOST,
      DB_PORT,
      DB_NAME,
      DB_USERNAME,
      DB_PASSWORD
    );
    logger.debug(this.url);
    return new Promise(this.connection.bind(this));
  }
}

export = new MongoDB();
