// eslint-disable-next-line no-unused-vars
import { AbstractRepository, EntityManager, EntityRepository, getCustomRepository } from 'typeorm';
import moment from 'moment';
import config from '@app/config';
import UserPasswordReset from '@app/db/entity/UserPasswordReset';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';
import { OTPUtil } from '@app/util';
import { EmailService } from '@app/service';
import { InvalidTokenException } from '@app/common/error';
import UserRepository from './UserRepository';

@EntityRepository(UserPasswordReset)
export default class UserPasswordResetRepository extends AbstractRepository<UserPasswordReset> {
  public request(user: User, entityManager?: EntityManager): Promise<UserPasswordReset> {
    const callback = async (em: EntityManager) => {
      const userPasswordReset: UserPasswordReset = await em.save(
        UserPasswordReset,
        em.create(UserPasswordReset, {
          user,
          token: await OTPUtil.alphanumerical(config.SECURITY.TOKEN.PASSWORD.LENGTH),
          consumed: false,
        })
      );
      // TODO Change from
      // TODO Change email URL to reset
      await EmailService.send({
        from: '"Happy Puppy" <password_reset@happypuppy.com>',
        to: user.email,
        subject: 'Happy Puppy password reset',
        // TODO Remove Typescript ignore
        // @ts-ignore
        template: 'password_reset',
        context: {
          username: user.username,
          token: userPasswordReset.token,
        },
      });

      return Promise.resolve(userPasswordReset);
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  public change(
    userPasswordReset: UserPasswordReset,
    entityManager?: EntityManager
  ): Promise<User> {
    const callback = async (em: EntityManager) => {
      const foundUserPasswordReset: UserPasswordReset = await em.findOneOrFail(UserPasswordReset, {
        where: { token: userPasswordReset.token, consumed: false },
        relations: ['user'],
      });

      if (
        foundUserPasswordReset.consumed ||
        moment(new Date()).diff(foundUserPasswordReset.updated_at, 'minutes') >
          config.SECURITY.TOKEN.PASSWORD.EXPIRATION
      ) {
        throw new InvalidTokenException('User password reset token is expired');
      }

      foundUserPasswordReset.user.password = userPasswordReset.password;
      foundUserPasswordReset.consumed = true;

      await em.save(UserPasswordReset, foundUserPasswordReset);

      return Promise.resolve(
        getCustomRepository(UserRepository).updateOrFail(foundUserPasswordReset.user, em)
      );
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }
}
