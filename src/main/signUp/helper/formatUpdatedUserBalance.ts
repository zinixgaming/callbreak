import {getUser} from '../../gameTable/utils';
import logger from '../../logger';
import {getUserOwnProfile} from '../../clientsideapi';
import {upadedBalanceIf} from '../../interface/responseIf';
import {NUMERICAL} from '../../../constants';

interface resObjI {
  userId: string;
  balance: number;
}

async function formatUpdatedUserBalance(
  userIds: string[],
): Promise<upadedBalanceIf[] | undefined> {
  try {
    const updatedWalletAmount = <upadedBalanceIf[]>[];
    for (let index = 0; index < userIds.length; index++) {
      const element = userIds[index];
      const getUsers = await getUser(element);
      const userOwnProfile = await getUserOwnProfile(
        getUsers.authToken,
        getUsers.socketId,
        getUsers.userId,
      );

      const updatedBalance: number =
        userOwnProfile?.user?.winCash + userOwnProfile?.user?.cash || 0;

      const resObj: upadedBalanceIf = {
        userId: getUsers.userId,
        balance: Number(updatedBalance.toFixed(2)),
      };
      updatedWalletAmount.push(resObj);
    }
    if (updatedWalletAmount.length > NUMERICAL.ZERO) {
      return updatedWalletAmount;
    } else {
      throw new Error(`formatUpdatedUserBalance failed`);
    }
  } catch (error) {
    logger.error(
      'CATCH_ERROR: formatUpdatedUserBalance ::',
      error,
      '-',
      userIds,
    );
    throw new Error(`formatUpdatedUserBalance ERROR`);
  }
}

export = formatUpdatedUserBalance;
