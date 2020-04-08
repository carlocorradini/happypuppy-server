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
  // eslint-disable-next-line no-unused-vars
  EntityManager,
  // eslint-disable-next-line no-unused-vars
  SaveOptions,
  Not,
} from 'typeorm';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';
import { EntityUtil } from '@app/util';
// eslint-disable-next-line no-unused-vars
import { DuplicateEntityError, UserNotVerifiedError } from '@app/common/error';
// eslint-disable-next-line no-unused-vars
import { Duplicate } from '@app/common/error/DuplicateEntityError';
import UserVerificationRepository from './UserVerificationRepository';

@EntityRepository(User)
export default class UserRepository extends AbstractRepository<User> {
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
    const selectableColumns = EntityUtil.selectableColumns(User, ['verified']);

    if (maybeOptions === undefined) {
      // eslint-disable-next-line no-param-reassign
      maybeOptions = {
        select: selectableColumns,
      };
    } else if (maybeOptions.select === undefined) {
      // eslint-disable-next-line no-param-reassign
      maybeOptions = Object.assign(maybeOptions, {
        select: selectableColumns,
      });
    } else if (Array.isArray(maybeOptions.select)) {
      maybeOptions.select.push('verified');
    }

    return this.manager
      .findOneOrFail(User, optionsOrConditions as any, maybeOptions)
      .then((user) => {
        return !user.verified
          ? Promise.reject(new UserNotVerifiedError('User is not verified'))
          : Promise.resolve(user);
      });
  }

  public async saveOrFail(user: User, entityManager?: EntityManager): Promise<User> {
    const callback = async (em: EntityManager) => {
      const newUser: User = await UserRepository.saveUnique(user, em);

      await em.getCustomRepository(UserVerificationRepository).saveOrFail(newUser, em);

      return Promise.resolve(newUser);
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  public async updateOrFail(user: User, entityManager?: EntityManager): Promise<User> {
    const callback = async (em: EntityManager) => {
      const userToUpdate: User = await em.findOneOrFail(User, {
        where: { id: user.id },
      });
      await em.merge(User, userToUpdate, user);
      return UserRepository.updateUnique(userToUpdate, em);
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  public async deleteOrFail(user: User, entityManager?: EntityManager): Promise<DeleteResult> {
    const callback = async (em: EntityManager) => {
      await em.findOneOrFail(User, user);
      return em.delete(User, user);
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  private static async saveUnique(
    user: User,
    entityManager: EntityManager,
    saveOptions?: SaveOptions
  ): Promise<User> {
    const duplicateFields = new Set<Duplicate>();
    const uniqueColumns = EntityUtil.uniqueColumns(User);
    const whereConditions = uniqueColumns.map((u) => {
      return { [u]: user[u] };
    });
    const duplicateEntities = await entityManager.find(User, {
      where: whereConditions,
      select: uniqueColumns,
    });
    duplicateEntities.forEach((_user) => {
      uniqueColumns.forEach((u) => {
        if (user[u] === _user[u]) {
          duplicateFields.add({ property: u.toString(), value: user[u] });
        }
      });
    });

    if (duplicateFields.size !== 0)
      throw new DuplicateEntityError(`Duplicate User entity found`, Array.from(duplicateFields));

    return entityManager.save(User, user, saveOptions);
  }

  private static async updateUnique(
    user: User,
    entityManager: EntityManager,
    saveOptions?: SaveOptions
  ): Promise<User> {
    const duplicateFields = new Set<Duplicate>();
    const uniqueColumns = EntityUtil.uniqueColumns(User);
    const whereConditions = uniqueColumns.map((u) => {
      return { [u]: user[u], id: Not(user.id) };
    });

    const duplicateEntities = await entityManager.find(User, {
      where: whereConditions,
      select: uniqueColumns,
    });
    duplicateEntities.forEach((_user) => {
      uniqueColumns.forEach((u) => {
        if (user[u] === _user[u]) {
          duplicateFields.add({ property: u.toString(), value: user[u] });
        }
      });
    });

    if (duplicateFields.size !== 0)
      throw new DuplicateEntityError(`Duplicate User entity found`, Array.from(duplicateFields));

    return entityManager.save(User, user, saveOptions);
  }
}
