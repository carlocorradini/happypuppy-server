/* eslint-disable no-dupe-class-members */
// eslint-disable-next-line no-unused-vars
import {
  AbstractRepository,
  EntityRepository,
  // eslint-disable-next-line no-unused-vars
  FindOneOptions,
  // eslint-disable-next-line no-unused-vars
  ObjectID,
  // eslint-disable-next-line no-unused-vars
  FindConditions,
  // eslint-disable-next-line no-unused-vars
  DeleteResult,
} from 'typeorm';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';
// eslint-disable-next-line no-unused-vars
import { DuplicateEntityError, UserNotVerifiedError } from './error';
// eslint-disable-next-line no-unused-vars
import { Duplicate } from './error/DuplicateEntityError';

@EntityRepository(User)
export default class UserRepository extends AbstractRepository<User> {
  public findOneAndVerifiedOrFail(
    id?: string | number | Date | ObjectID,
    options?: FindOneOptions<User>
  ): Promise<User>;

  public findOneAndVerifiedOrFail(options?: FindOneOptions<User>): Promise<User>;

  public findOneAndVerifiedOrFail(
    conditions?: FindConditions<User>,
    options?: FindOneOptions<User>
  ): Promise<User>;

  public async findOneAndVerifiedOrFail(
    optionsOrConditions?:
      | string
      | number
      | Date
      | ObjectID
      | FindOneOptions<User>
      | FindConditions<User>,
    maybeOptions?: FindOneOptions<User>
  ): Promise<User> {
    if (maybeOptions?.select) maybeOptions.select.push('verified');
    // eslint-disable-next-line no-param-reassign
    else if (maybeOptions !== undefined) maybeOptions.select = ['verified'];
    // eslint-disable-next-line no-param-reassign
    else maybeOptions = { select: ['verified'] };

    return this.manager
      .findOneOrFail(User, optionsOrConditions as any, maybeOptions)
      .then((user) => {
        return !user.verified
          ? Promise.reject(new UserNotVerifiedError('User is not verified'))
          : Promise.resolve(user);
      });
  }

  public saveOrFail(user: User): Promise<User> {
    return this.manager.transaction(async (entityManager) => {
      const fields = new Set<Duplicate>();
      const users = await entityManager.find(User, {
        where: [{ username: user.username }, { email: user.email }, { phone: user.phone }],
        select: ['username', 'email', 'phone'],
      });

      users.forEach((_user) => {
        if (user.username === _user.username) {
          fields.add({ property: 'username', value: user.username });
        }
        if (user.email === _user.email) {
          fields.add({ property: 'email', value: user.email });
        }
        if (user.phone === _user.phone) {
          fields.add({ property: 'phone', value: user.phone });
        }
      });

      if (fields.size !== 0)
        throw new DuplicateEntityError('Duplicate User found', Array.from(fields));
      return entityManager.save(User, user);
    });
  }

  // TODO Validazione duplicati dato che per ora puoi aggiornare solo valori non unique
  public updateOrFail(user: User): Promise<User> {
    return this.manager.transaction(async (entityManager) => {
      const userToUpdate: User = await entityManager.findOneOrFail(User, {
        where: { id: user.id },
      });
      await entityManager.merge(User, userToUpdate, user);
      return entityManager.save(User, userToUpdate);
    });
  }

  public deleteOrFail(user: User): Promise<DeleteResult> {
    return this.manager.transaction(async (entityManager) => {
      await entityManager.findOneOrFail(User, user);
      return entityManager.delete(User, user);
    });
  }
}
