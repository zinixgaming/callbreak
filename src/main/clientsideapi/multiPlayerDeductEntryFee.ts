import axios from "axios"
import { multiPlayerDeductEntryFeeIf, multiPlayerDeductEntryFeeResponse } from '../interface/cmgApiIf';
import CommonEventEmitter from "../commonEventEmitter";
import Errors from "../errors";
import { getConfig } from "../../config";
import { EVENTS, MESSAGES, NUMERICAL } from "../../constants";
const { MULTI_PLAYER_DEDUCT_ENTRY_FEE, APP_KEY, APP_DATA } = getConfig();
import Logger from "../logger";


async function multiPlayerDeductEntryFee(data: multiPlayerDeductEntryFeeIf, token: string, socketId: string): Promise<multiPlayerDeductEntryFeeResponse> {
    const tableId = data.tableId;
    Logger.info(tableId, "multiPlayerDeductEntryFee :: ", data, token)
    try {
        const url = MULTI_PLAYER_DEDUCT_ENTRY_FEE;
        Logger.info(tableId, "multiPlayerDeductEntryFee :: url :: ", url)

        let responce = await axios.post(url, data, { headers: { 'Authorization': `${token}`, 'x-mgpapp-key': APP_KEY, 'x-mgpapp-data': APP_DATA } })
        Logger.info("multiPlayerDeductEntryFee : responce :: ", responce.data);

        let multiPlayerDeductEntryFeeDetails = responce.data.data;
        Logger.info(tableId, "resData : multiPlayerDeductEntryFee :: ", multiPlayerDeductEntryFeeDetails);

        if (!responce || !responce.data || !multiPlayerDeductEntryFeeDetails) {
            throw new Errors.CancelBattle('Unable to fetch collect amount data');
        }
        return multiPlayerDeductEntryFeeDetails;

    } catch (error: any) {
        console.log( "error.response.data ", error);
        Logger.error(tableId, "error.response.data ", error);
        Logger.error(tableId, 'CATCH_ERROR :  multiPlayerDeductEntryFeeDetails :>> ', data, token, "-", error);
        throw new Errors.CancelBattle("get multi Player Deduct Entry Fee fail");

    }
}

const exportedObj = {
    multiPlayerDeductEntryFee,
};

export = exportedObj;