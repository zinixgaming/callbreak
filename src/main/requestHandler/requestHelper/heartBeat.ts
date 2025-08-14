import socketAck from '../../../socketAck';
import CommonEventEmitter from '../../commonEventEmitter';
import { EVENTS } from '../../../constants';

function heartBeat(data: any, socket: any, ack: any) {
  const response = data.data;
  // CommonEventEmitter.emit(EVENTS.HEART_BEAT_SOCKET_EVENT, {
  //   socket,
  //   data: {},
  // });

  socketAck.ackMid(
    EVENTS.HEART_BEAT_SOCKET_EVENT,
    response,
    // socket.metrics,
    socket.userId,
    response && 'tableId' in response ? response.tableId : '', // sometime tableId doesn't exist
    ack,
  );
}

export = heartBeat;
