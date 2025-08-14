import socketOps from './socket';
import httpServer from './http';
import rdsOps from './redis';
import config from '../config';
import mongo from './mongo';

const exportObject = {socketOps, httpServer, rdsOps, config, mongo};

export = exportObject;
