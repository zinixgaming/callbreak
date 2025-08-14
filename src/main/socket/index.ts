import {BOT} from '../../constants';
import logger from '../logger';

async function sendEventToClient(socket: any, data: any) {
  try {
    const {socketClient}: any = global;
    if (data.en != 'HEART_BEAT') logger.debug('SEND EVENT TO CLIENT: ', data);

    const encData = JSON.stringify(data);

    // encData = await MeAuLib.metricsEmitMid(encData, ''); // no need for call-break

    if (typeof socket !== 'string' && socket.emit)
      socket.emit(data.en, {data: encData});
    else socketClient.to(socket).emit(data.en, {data: encData});
  } catch (error) {
    logger.error('CATCH_ERROR : sendEventToClient : error :: ', error);
  }
}

async function sendEventToRoom(roomId: any, data: any) {
  const {socketClient}: any = global;
  logger.debug(
    roomId,
    'SEND EVENT TO ROOM roomId socketClient',
    typeof socketClient,
  );
  logger.debug(roomId, 'SEND EVENT TO ROOM roomId', roomId);
  logger.debug(roomId, 'SEND EVENT TO ROOM', data);
  // const encData = encryptData(data);
  const encData = JSON.stringify(data);
  // encData = await MeAuLib.metricsEmitMid(encData, ''); // no need
  // const { socketClient }:any = global;
  socketClient.to(roomId).emit(data.en, {data: encData});
}

function addClientInRoom(socket: any, roomId: any) {
  if (socket.id !== 'FTUE_BOT_ID' && socket.id !== BOT.ID)
    return socket.join(roomId);
  else return true;
}

async function leaveClientInRoom(socket: any, roomId: any) {
  socket = await getSocketFromSocketId(socket);
  if (typeof socket != 'undefined' && socket.emit) socket.leave(roomId);
}

function getAllSocketsInTable(roomId: any) {
  const {socketClient}: any = global;
  return socketClient.in(roomId).allSockets();
}

function getSocketFromSocketId(socketId: any) {
  const {socketClient}: any = global;
  return socketClient.sockets.sockets.get(socketId);
}

const exportObject = {
  getSocketFromSocketId,
  getAllSocketsInTable,
  sendEventToClient,
  sendEventToRoom,
  addClientInRoom,
  leaveClientInRoom,
};
export = exportObject;
