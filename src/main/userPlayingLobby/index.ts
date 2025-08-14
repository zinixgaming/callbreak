import { getUser } from '../gameTable/utils';
import { userIf } from '../interface/userSignUpIf';
import logger from '../logger';

interface resDataI {
    lobbyId: string;
    gameId: string;
}

async function userPlayingLobby(req: any, res: any) {
    const { userId } = req.body;
    try {
        logger.info(userId, "req.body ", req.body);
        const userDetails: userIf = await getUser(userId);
        logger.info(userId, "userDetails ", userDetails);

        let resData: resDataI = <resDataI>{};
        let isUserPlaying : boolean = false;
        if(userDetails && userDetails.lobbyId && userDetails.gameId) {
            isUserPlaying = true;
            resData.lobbyId = userDetails.lobbyId;
            resData.gameId = userDetails.gameId;
        }else{
            throw new Error("fetch User Playing Lobby Details failed");
        }
        logger.info(userId, "resData ", resData);

        const sendObject = {
            status: 200,
            success: true,
            message: "User Playing Lobby Details",
            data: {
                isUserPlaying,
                gameDetails : resData
            },
        }
        res.send(sendObject);

    } catch (error) {
        logger.error(userId, "CATCH_userPlayingLobby : ERROR ::", error);

        const sendObject = {
            status: 400,
            success: false,
            message: "fetch User Playing Lobby Details failed!",
            data: {
                isUserPlaying : false,
                gameDetails : null
            }
        }
        res.send(sendObject);
    }
}

export = userPlayingLobby;