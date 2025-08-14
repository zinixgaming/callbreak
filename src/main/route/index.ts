import db from '../db';
import getPlayerOnlineCount from '../playerOnlineOfflineCount';
import getPlayerOnlineCountLobbyWise from '../playerOnlineCountLobbyWise';
import {
  getTrackingLobby,
  getTableHistory,
  playingTrackingFlage,
} from '../PlayingTracking/playTracking';
import allLobbyWiseOnlinePlayer from '../allLobbyWiesOnlinePlayer';
import userPlayingLobby from '../userPlayingLobby';
import multipleLoginHandler from '../multipleLoginHandler';

import express from 'express';

const router = express.Router();

router.get('/test', async (req: any, res: any) => {
  res.status(200).send('OK');
});

router.get('/123', (req, res) => {
  res.send('231');
});

// router.post("/userPlayingLobby", userPlayingLobby);

// router.post('/getTtackingLobby', getTrackingLobby);
// router.post('/history', getTableHistory);
// router.post('/playingTrackingFlage', playingTrackingFlage);

router.post('/getOnlinePlayerCount', getPlayerOnlineCount);
router.post('/getPlayerOnlineCountLobbyWise', getPlayerOnlineCountLobbyWise);
router.post('/allLobbyWiseOnlinePlayer', allLobbyWiseOnlinePlayer);

router.post('/multiLoginLogoutFromGameServer', multipleLoginHandler);

import {Router} from 'express';

const exportObject: {router: Router} = {
  router,
};

export = exportObject;
