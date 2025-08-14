import logger from "../logger";
import Errors from "../errors";
import {
    EVENTS,
    HELP_RULES,
} from "../../constants";
import { helpMenuRulsRequestIf } from '../interface/requestIf'
import { getUser } from "../gameTable/utils";
import { gameSettinghelp } from '../clientsideapi'
import socketAck from '../../socketAck';

async function settingMenuHelp(
    data: helpMenuRulsRequestIf,
    socket: any,
    ack?: Function) {
    try {
        logger.debug("settingMenuHelp :: ", data)

        const  { userId }  = data;
        const { tableId } = socket.eventMetaData;
        const socketId = socket.id;
        
        // const rules = HELP_RULES
        // console.log('settingMenuHelp : ruls :>> ', rules);

        const getUserDetail = await getUser(userId);

        const gameId = getUserDetail.gameId
        
        const token = getUserDetail.authToken 

        const help = await gameSettinghelp(gameId , token, socketId, userId)

        if (ack) {
            socketAck.ackMid(
                EVENTS.GAME_SETTING_MENU_HELP_SOCKET_EVENT,
                {
                    success: true,
                    error: null,
                    data: help.howToPlay,
                },
                data.userId,
                tableId,
                ack,
            );
        }


    } catch (error) {
        logger.error("CATCH_ERROR : settingMenuHelp :: ", data, " - ", error)

    }

}

export = settingMenuHelp;