
import logger from "../logger";
import { NUMERICAL } from '../../constants';
import { ONLINE_PLAYER_LOBBY } from '../../constants/redis';
import { getOnliPlayerCountLobbyWise } from '../gameTable/utils'



async function allLobbyWiseOnlinePlayer(req: any, res: any) {
    try {

        logger.info('allLobbyWiseOnlinePlayer :: req.body  :::', req.body);
        let query = { lobbyIds: req.body.lobbyIds }

        const lobbyIds = query.lobbyIds;
        logger.info('allLobbyWiseOnlinePlayer :: lobbyIds  :::', lobbyIds);

        if(!lobbyIds){
            const resObject = {
                status: 400,
                success: false,
                message: "oops! Something want wrong",
                data: null
            }
            return res.send(resObject)
        }
       
        let onlinePlayers: any[] = [];

        for (let index = 0; index < lobbyIds.length; index++) {
            const element = lobbyIds[index];

            const getOnlinePlayer = await getOnliPlayerCountLobbyWise(ONLINE_PLAYER_LOBBY, element);
            logger.info('allLobbyWiseOnlinePlayer :: getOnlinePlayer  :::', getOnlinePlayer);
            
            const data = {
                lobbyId: element,
                lobbyWiseOnlinePlayer: getOnlinePlayer == null ? NUMERICAL.ZERO : getOnlinePlayer
            }
            onlinePlayers.push(data)
        }
        logger.info('allLobbyWiseOnlinePlayer :: onlinePlayers  :::', onlinePlayers);

        const resObject = {
            status: 200,
            success: true,
            message: "online players",
            data: onlinePlayers
        }
        return res.send(resObject)

    } catch (error) {
        logger.info('allLobbyWiseOnlinePlayer :>> ', error);
        const resObject = {
            status: 400,
            success: false,
            message: "oops! Something want wrong",
            data: null
        }
        return res.send(resObject)
    }
}

export = allLobbyWiseOnlinePlayer