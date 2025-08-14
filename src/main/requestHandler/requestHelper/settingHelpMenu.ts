import logger from '../../logger';
import settingMenuHelp from '../../gameSettingMenuHelp';

async function showSettingMenuHelpInfoHelper(
  {data}: any,
  socket: any,
  ack?: (response: any) => void,
) {
  try {
    return await settingMenuHelp(data, socket, ack);
  } catch (error) {
    logger.error(
      socket.eventMetaData.tableId,
      'CATCH_ERROR:  showSettingMenuHelpInfoHelper :: ',
      error,
    );
  }
}

export = showSettingMenuHelpInfoHelper;
