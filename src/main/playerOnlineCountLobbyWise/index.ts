import {getOnliPlayerCountLobbyWise} from '../gameTable/utils'
import {ONLINE_PLAYER_LOBBY } from '../../constants/redis'
import  logger  from '../logger';
import { NUMERICAL } from '../../constants';


async function getPlayerOnlineCountLobbyWise(req: any,res: any) {
    try {
        logger.info('getPlayerOnlineCountLobbyWise :: req.body  :::', req.body);
        const query = {
            lobbyId : req.body.lobbyId
        }
        
        if(!query.lobbyId){
            const resObject = {
                status: 400,
                success: false,
                message: "oops! Something want wrong",
                data: null
            }
            return res.send(resObject)
        }

        const onlinePlayerCountLobbyWise = await getOnliPlayerCountLobbyWise(ONLINE_PLAYER_LOBBY, query.lobbyId);
        logger.info("getPlayerOnlineCountLobbyWise : onlinePlayerCount :: ", onlinePlayerCountLobbyWise)

        if(!onlinePlayerCountLobbyWise) {
            const sendObject = {
                status: 200,
                success: true,
                message: "Online Player lobbyId",
                data: NUMERICAL.ZERO,
            }
            return res.send(sendObject);
        }
    
        const sendObject = {
            status: 200,
            success: true,
            message: "Player Online in lobby ",
            data: onlinePlayerCountLobbyWise == null ? NUMERICAL.ZERO : onlinePlayerCountLobbyWise, 
        }
    
        return res.send(sendObject);
    } catch (error) {
        logger.error("CATCH_ERROR :: " , error) 
    }
}

export = getPlayerOnlineCountLobbyWise;