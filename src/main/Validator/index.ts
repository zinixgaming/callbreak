import methodValidator from './methodValidator';
import requestValidator from './requestValidator';
import responseValidator from './responseValidator';
import schedulerValidator from './schedulerValidator';
import lobbyValidator from './lobbyValidator';
import playingTrackingValidator from './playingTrackingValidator'

const exportObject = {
  methodValidator,
  requestValidator,
  responseValidator,
  schedulerValidator,
  lobbyValidator,
  playingTrackingValidator,
};

export = exportObject;
