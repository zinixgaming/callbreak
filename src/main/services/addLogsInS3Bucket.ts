import { userSeatsIf } from "../interface/roundTableIf";
import s3BucketServices from "./s3BucketServices";
import logger from "../logger";


async function addLogsInS3Bucket(tableId: string, playerSeats: userSeatsIf) {

    try {
        logger.info("starting Adding logs in S3 bucket");
        //table details added
        await s3BucketServices(tableId);

        //users details added
        Object.keys(playerSeats).map(async (ele) => {
            s3BucketServices(playerSeats[ele].userId);
        })

    } catch (error: any) {
        logger.error(`Error addLogsInS3Bucket() ERROR : ${error}`);
    }

}

export = addLogsInS3Bucket;