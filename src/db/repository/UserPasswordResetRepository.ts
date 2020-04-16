// eslint-disable-next-line no-unused-vars
import { AbstractRepository, EntityManager, EntityRepository } from 'typeorm';
import config from '@app/config';
import UserPasswordReset from '@app/db/entity/UserPasswordReset';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';
import { OTPUtil } from '@app/util';
import { EmailService } from '@app/service';

@EntityRepository(UserPasswordReset)
export default class UserPasswordResetRepository extends AbstractRepository<UserPasswordReset> {
  public saveOrFail(user: User, entityManager?: EntityManager): Promise<UserPasswordReset> {
    const callback = async (em: EntityManager) => {
      const userPasswordReset: UserPasswordReset = await em.save(
        UserPasswordReset,
        em.create(UserPasswordReset, {
          user,
          token: await OTPUtil.alphanumerical(config.SECURITY.TOKEN.PASSWORD.LENGTH),
        })
      );
      // TODO Change from
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
}
