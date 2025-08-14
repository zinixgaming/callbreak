import {EVENTS} from '../constants';
import heartBeat from '../main/requestHandler/requestHelper/heartBeat';

// @ts-expect-error - function parameters are not typed for legacy compatibility
function ackMid(en, response, userId, tableId, ack) {
  try {
    // console.log('ackMid : ', en, response, metrics, userId, tableId);
    if (response && 'tableId' in response && response.success)
      delete response.tableId;
    // metrics.srpt = Date.now();
    if (en != EVENTS.HEART_BEAT_SOCKET_EVENT) {
      console.log('acknowleadgement event::>> ', en, JSON.stringify(response));
    }
    ack(
      JSON.stringify({
        en: en,
        data: response,
        // metrics: metrics,
        userId,
        tableId,
      }),
    );
  } catch (error) {
    console.log('CATCH_ERROR in ackMid: ', error);
    // @ts-expect-error - Error constructor signature mismatch
    throw new Error('ackMid error catch  : ', error);
  }
}

const exportObject = {
  ackMid,
};

export = exportObject;
