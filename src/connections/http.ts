const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
import { getConfig } from "../config";
const { HTTPS_KEY,  HTTPS_CERT, NODE_ENV} = getConfig();


import { router } from '../main/route';
import bodyParser from 'body-parser';
import cron from 'node-cron'
import cronJob from '../main/PlayingTracking/helper/cronJobSchedule'
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(router);


let httpserver : any;

 if (fs.existsSync(path.join(__dirname + HTTPS_KEY)) && fs.existsSync(path.join(__dirname + HTTPS_CERT)) ) {
  var httpsOptions = {
    key: fs.readFileSync( path.join(__dirname + HTTPS_KEY) ),
    cert: fs.readFileSync( path.join(__dirname + HTTPS_CERT) ),
  };
   console.log('Directory exists! :: start :: >> https');
   httpserver = require("https").createServer(httpsOptions, app);

} else {

  console.log('Directory not found. :::: start ::>> http');
  httpserver = require("http").Server(app);

}

// cron job at every 12 am 
// cron.schedule('0 0 * * *',async  () => {
//   console.log('running cron job schedule every 12Am..');
  // await cronJob();
  // if(NODE_ENV == 'STAGE' || NODE_ENV == 'PRODUCTION') {
  //   await logsManage();
  // }
// });

// setTimeout(async() => {
//   await cronJob();
// }, 2500)

app.get('/test', (req: object, res: { status: Function }) =>
  res.status(200).send({ status: 'OK' }),
);

export = httpserver;
