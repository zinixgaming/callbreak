import fs from 'fs';
import path from 'path';
import cors from 'cors';
import express from 'express';
import https from 'https';
import http from 'http';
import {getConfig} from '../config';
import {router} from '../main/route';

const {HTTPS_KEY, HTTPS_CERT} = getConfig();

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(router);

let httpserver: any;

if (
  fs.existsSync(path.join(__dirname + HTTPS_KEY)) &&
  fs.existsSync(path.join(__dirname + HTTPS_CERT))
) {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname + HTTPS_KEY)),
    cert: fs.readFileSync(path.join(__dirname + HTTPS_CERT)),
  };
  console.log('Directory exists! :: start :: >> https');
  httpserver = https.createServer(httpsOptions, app);
} else {
  console.log('Directory not found. :::: start ::>> http');
  httpserver = http.createServer(app);
}

app.get(
  '/test',
  (
    req: object,
    res: {status: (code: number) => {send: (data: object) => void}},
  ) => res.status(200).send({status: 'OK'}),
);

export default httpserver;
