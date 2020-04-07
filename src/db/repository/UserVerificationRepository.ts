import { AbstractRepository, EntityRepository } from 'typeorm';
// eslint-disable-next-line no-unused-vars
import UserVerification from '@app/db/entity/UserVerification';
import User from '@app/db/entity/User';
import { EntityNotFoundError, DataMismatchError } from './error';

@EntityRepository(UserVerification)
export default class UserVerificationRepository extends AbstractRepository<UserVerification> {
  public verifyOrFail(userVerification: UserVerification): Promise<User> {
    return this.manager.transaction(async (entityManager) => {
      const foundVerication = await entityManager
        .createQueryBuilder(UserVerification, 'uv')
        .innerJoin('uv.user', 'user')
        .andWhere('user.verified = FALSE')
        .getOne();

      if (foundVerication === undefined)
        throw new EntityNotFoundError(
          'Verification codes does not match or User was already verified'
        );
      if (
        foundVerication.email_code !== userVerification.email_code ||
        foundVerication.phone_code !== userVerification.phone_code
      ) {
        throw new DataMismatchError('Verification codes does not match');
      }

      return entityManager.save(
        entityManager.create(User, { id: foundVerication.user_id, verified: true })
      );
    });
  }
}
