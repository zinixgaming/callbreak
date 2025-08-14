import logger from '../../logger';
import DB from '../../db';
import { MONGO } from '../../../constants';
import validator from '../../Validator'
import auth from '../auth';


async function playingTrackingFlage(req: any, res: any) {
    try {

        logger.info(" playingTrackingFlage :: req.body :: ", req.body);
        const authKey = req.headers["authorization"];
        const gameId = req.body.gameId

        // ----------------------- for JWT authrozation ----------------
        const key = await auth(authKey);
        logger.info(" playingTrackingFlage :: key :: ", key);

        if (key.data == gameId) {
            const flage = await validator.playingTrackingValidator.playingTrackingFlageValidator(req.body);

            const findFlageQuery = { gameId };
            const findFlage = await DB.mongoQuery.getOne(MONGO.FLAGE, findFlageQuery);
            logger.info("playingTrackingFlage  :: findFlage :: ", findFlage)

            if (findFlage) {
                let update = {
                    $set: {
                        isPlayingTracking: req.body.isPlayingTracking,
                        noOfLastTrakingDays: req.body.noOfLastTrakingDays
                    }
                };
                const updateFlage = await DB.mongoQuery.updateByCond(MONGO.FLAGE, { _id: DB.ObjectId(findFlage._id) }, update);
                const sendObj = {
                            status: 200,
                            success: true,
                            message: "flage update successfulley",
                            data: updateFlage
                        }
                        return  res.send(sendObj)
            }else{
                const Addflage = await DB.mongoQuery.add(MONGO.FLAGE, flage);

                    const sendObj = {
                        status: 200,
                        success: true,
                        message: "flage added successfulley",
                        data: Addflage
                    }
                    return res.send(sendObj)
            }
        }else{
            const sendObject = {
                        status: 200,
                        success: false,
                        message: 'authorization fail',
                        data: null,
                    };
                    return res.send(sendObject);
        }


    } catch (error) {
        logger.error('CATCH_ERROR : playingTrackingFlage ::', error)
    }
}

export = playingTrackingFlage