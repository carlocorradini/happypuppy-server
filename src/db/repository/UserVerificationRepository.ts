/* eslint-disable no-dupe-class-members */
// eslint-disable-next-line no-unused-vars
import { AbstractRepository, EntityRepository, EntityManager } from 'typeorm';
// eslint-disable-next-line no-unused-vars
import UserVerification from '@app/db/entity/UserVerification';
import User from '@app/db/entity/User';
import OTPHelper from '@app/helper/OTPHelper';
import { OTPUtil } from '@app/util';
import config from '@app/config';
import {
  EntityNotFoundError,
  DataMismatchError,
  UserAlreadyVerifiedError,
} from '@app/common/error';

@EntityRepository(UserVerification)
export default class UserVerificationRepository extends AbstractRepository<UserVerification> {
  public async saveOrFail(user: User, entityManager?: EntityManager): Promise<UserVerification> {
    const callback = async (em: EntityManager) => {
      const userVerification = await em.save(
        UserVerification,
        em.create(UserVerification, {
          user,
          otp_email: await OTPUtil.digits(config.SECURITY.OTP.EMAIL.DIGITS),
          otp_phone: await OTPUtil.digits(config.SECURITY.OTP.PHONE.DIGITS),
        })
      );

      await OTPHelper.send(user, userVerification);
      return Promise.resolve(userVerification);
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  public async verifyOrFail(
    userVerification: UserVerification,
    entityManager?: EntityManager
  ): Promise<User> {
    const callback = async (em: EntityManager) => {
      const foundVerication = await em
        .createQueryBuilder(UserVerification, 'uv')
        .leftJoinAndSelect('uv.user', 'user')
        .addSelect('user.verified')
        .getOne();

      if (foundVerication === undefined)
        throw new EntityNotFoundError('User not found or was already verified');
      if (foundVerication.user.verified === undefined || foundVerication.user.verified)
        throw new UserAlreadyVerifiedError('User was already verified');
      if (
        foundVerication.otp_email !== userVerification.otp_email ||
        foundVerication.otp_phone !== userVerification.otp_phone
      ) {
        throw new DataMismatchError('OTP codes does not match');
      }

      return em.save(em.create(User, { id: foundVerication.user_id, verified: true }));
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }
}
