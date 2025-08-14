
import { getOnliPlayerCount } from '../gameTable/utils'
import {ONLINEPLAYER } from '../../constants/redis'
import  logger  from '../logger';
import { NUMERICAL } from '../../constants';

async function getPlayerOnlineCount(req:any , res:any) {
    try {
        logger.info('getPlayerOnlineCount :: req.body  :::', req.body);
        const onlinePlayerCount = await getOnliPlayerCount(ONLINEPLAYER);
        logger.info("getPlayerOnlineCount : onlinePlayerCount :: ", onlinePlayerCount)

        if(!onlinePlayerCount){
            const sendObject = {
                status: 200,
                success: true,
                message: "Online Player",
                data: NUMERICAL.ZERO, 
            }
            return res.send(sendObject);
        }
    
        const sendObject = {
            status: 200,
            success: true,
            message: "Online Player",
            data: onlinePlayerCount == null ? NUMERICAL.ZERO : onlinePlayerCount, 
        }
        return res.send(sendObject);
    } catch (error) {
        logger.error("CATCH_GETONLINEPLAYERCOUNT ::" , error)
    } 
}

export = getPlayerOnlineCount;