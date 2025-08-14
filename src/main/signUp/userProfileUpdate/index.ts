import {NUMERICAL} from '../../../constants';
import {getUserOwnProfile} from '../../clientsideapi';
import {setUser} from '../../gameTable/utils';
import {userIf} from '../../interface/userSignUpIf';
import logger from '../../logger';

async function userProfileUpdate(
  userDetail: userIf,
  socketId: string,
): Promise<any> {
  try {
    const userOwnProfile = await getUserOwnProfile(
      userDetail.authToken,
      socketId,
      userDetail.userId,
    );
    logger.info('userDetail ::: >>', userDetail);
    logger.info(
      userDetail.userId,
      'userOwnProfile  :: >> ',
      userOwnProfile,
      'Number(userDetail.latitude) :: ',
      Number(userDetail.latitude),
      'Number(userDetail.longitude) :: ',
      Number(userDetail.longitude),
    );

    let latitude: string = `${NUMERICAL.ZERO}`;
    let longitude: string = `${NUMERICAL.ZERO}`;

    if (
      !userDetail.latitude ||
      !userDetail.longitude ||
      Number(userDetail.latitude) == NUMERICAL.ZERO ||
      Number(userDetail.longitude) == NUMERICAL.ZERO
    ) {
      latitude = userOwnProfile.latitude || '0.0';
      longitude = userOwnProfile.longitude || '0.0';
    } else {
      latitude = userDetail.latitude;
      longitude = userDetail.longitude;
    }

    //balance set in user profile
    const balance =
      userOwnProfile?.user?.winCash + userOwnProfile?.user?.cash || 0;

    const updateUserQuery = {
      ...userDetail,
      latitude: latitude,
      longitude: longitude,
      balance: balance,
    };

    logger.info('updateUserQuery ::: >>', updateUserQuery);
    const userId = await setUser(userDetail.userId, updateUserQuery);

    return userId;
  } catch (error) {
    logger.error(
      userDetail._id,
      'CATCH_ERROR :userSignUp :: ',
      userDetail,
      error,
    );
  }
}

export = userProfileUpdate;
