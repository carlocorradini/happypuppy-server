// eslint-disable-next-line no-unused-vars
import { AbstractRepository, EntityRepository, EntityManager, getCustomRepository } from 'typeorm';
// eslint-disable-next-line no-unused-vars
import UserVerification from '@app/db/entity/UserVerification';
import User from '@app/db/entity/User';
import { OTPUtil } from '@app/util';
import config from '@app/config';
import {
  EntityNotFoundError,
  DataMismatchError,
  UserAlreadyVerifiedError,
} from '@app/common/error';
import { JWTHelper } from '@app/helper';
import { EmailService, PhoneService } from '@app/service';
import UserRepository from './UserRepository';

@EntityRepository(UserVerification)
export default class UserVerificationRepository extends AbstractRepository<UserVerification> {
  public findOneOrFail(user: User, entityManager: EntityManager): Promise<UserVerification> {
    const callback = async (em: EntityManager) => {
      const foundVerication = await em
        .createQueryBuilder(UserVerification, 'uv')
        .leftJoinAndSelect('uv.user', 'user')
        .addSelect('user.verified')
        .addSelect('user.email')
        .addSelect('user.phone')
        .where('uv.user.id = :user_id', { user_id: user.id })
        .getOne();

      if (foundVerication === undefined) throw new EntityNotFoundError('No verification was found');
      if (foundVerication.user.verified)
        throw new UserAlreadyVerifiedError('User was already verified');

      return foundVerication;
    };

    return entityManager === undefined
      ? this.manager.transaction(callback)
      : callback(entityManager);
  }

  public saveOrFail(user: User, entityManager?: EntityManager): Promise<UserVerification> {
    const callback = async (em: EntityManager) => {
      const userVerification: UserVerification = await em.save(
        UserVerification,
        em.create(UserVerification, {
          user,
          otp_email: await OTPUtil.digits(config.SECURITY.OTP.EMAIL.DIGITS),
          otp_phone: await OTPUtil.digits(config.SECURITY.OTP.PHONE.DIGITS),
        })
      );
      // TODO Change from
      await EmailService.send({
        from: '"Happy Puppy" <otp@happypuppy.com>',
        to: user.email,
        subject: 'Happy Puppy OTP code',
        // TODO Remove Typescript ignore
        // @ts-ignore
        template: 'otp',
        context: {
          username: user.username,
          otp_code: userVerification.otp_email,
        },
      });

      await PhoneService.send({
        from: config.SERVICE.PHONE.NUMBER,
        to: user.phone,
        body: `${user.username} OTP code: ${userVerification.otp_phone}`,
      });

      return Promise.resolve(userVerification);
    };

    return entityManager === undefined
      ? this.manager.transaction(callback)
      : callback(entityManager);
  }

  public verifyResendOrFail(user: User, entityManager?: EntityManager): Promise<UserVerification> {
    const callback = async (em: EntityManager) => {
      return this.saveOrFail((await this.findOneOrFail(user, em)).user, em);
    };

    return entityManager === undefined
      ? this.manager.transaction(callback)
      : callback(entityManager);
  }

  public verifyOrFail(
    userVerification: UserVerification,
    entityManager?: EntityManager
  ): Promise<string> {
    const callback = async (em: EntityManager) => {
      const foundVerication = await this.findOneOrFail(userVerification.user, em);

      if (
        foundVerication.otp_email !== userVerification.otp_email ||
        foundVerication.otp_phone !== userVerification.otp_phone
      ) {
        throw new DataMismatchError('OTP codes does not match');
      }

      const user: User = await getCustomRepository(UserRepository).updateOrFail(
        em.create(User, { id: foundVerication.user.id, verified: true })
      );
      return JWTHelper.sign({
        id: user.id,
        role: user.role,
      });
    };

    return entityManager === undefined
      ? this.manager.transaction(callback)
      : callback(entityManager);
  }
}
