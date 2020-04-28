// eslint-disable-next-line no-unused-vars
import {
  AbstractRepository,
  EntityRepository,
  // eslint-disable-next-line no-unused-vars
  EntityManager,
  // eslint-disable-next-line no-unused-vars
  SaveOptions,
  Not,
  // eslint-disable-next-line no-unused-vars
  DeleteResult,
} from 'typeorm';
import UserFriend, { UserFriendType } from '@app/db/entity/UserFriend';
// eslint-disable-next-line no-unused-vars
import { DuplicateEntityError } from '@app/common/error';
// eslint-disable-next-line no-unused-vars
import { Duplicate } from '@app/common/error/DuplicateEntityError';
import { EntityUtil } from '@app/util';
import User from '@app/db/entity/User';

@EntityRepository(UserFriend)
export default class UserFriendRepository extends AbstractRepository<UserFriend> {
  public saveOrFail(userFriend: UserFriend, entityManager?: EntityManager): Promise<UserFriend> {
    const callback = async (em: EntityManager) => {
      const userFriendFrom: UserFriend = em.create(UserFriend, {
        user: userFriend.user,
        friend: userFriend.friend,
        type: UserFriendType.WAITING_ACCEPTANCE,
      });
      const userFriendTo: UserFriend = em.create(UserFriend, {
        user: userFriend.friend,
        friend: userFriend.user,
        type: UserFriendType.FRIEND_REQUEST,
      });

      await UserFriendRepository.saveUnique(userFriendTo, em);
      return UserFriendRepository.saveUnique(userFriendFrom, em);
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  public updateOrFail(userFriend: UserFriend, entityManager?: EntityManager): Promise<UserFriend> {
    const callback = async (em: EntityManager) => {
      const userFriendFrom: UserFriend = await em
        .findOneOrFail(
          UserFriend,
          {
            user: userFriend.user,
            friend: userFriend.friend,
          },
          { loadRelationIds: true }
        )
        .then((_friend) => {
          // eslint-disable-next-line no-param-reassign
          _friend.user = em.create(User, { id: (_friend.user as unknown) as string });
          // eslint-disable-next-line no-param-reassign
          _friend.friend = em.create(User, { id: (_friend.friend as unknown) as string });
          return _friend;
        });
      const userFriendTo: UserFriend = await em
        .findOneOrFail(
          UserFriend,
          {
            user: userFriend.friend,
            friend: userFriend.user,
          },
          { loadRelationIds: true }
        )
        .then((_friend) => {
          // eslint-disable-next-line no-param-reassign
          _friend.user = em.create(User, { id: (_friend.user as unknown) as string });
          // eslint-disable-next-line no-param-reassign
          _friend.friend = em.create(User, { id: (_friend.friend as unknown) as string });
          return _friend;
        });

      switch (true) {
        case userFriend.type === UserFriendType.FRIEND &&
          userFriendFrom.type === UserFriendType.FRIEND_REQUEST &&
          userFriendTo.type === UserFriendType.WAITING_ACCEPTANCE: {
          // Friend request accepted
          await em.merge(UserFriend, userFriendFrom, { type: UserFriendType.FRIEND });
          await em.merge(UserFriend, userFriendTo, { type: UserFriendType.FRIEND });
          break;
        }
        case userFriend.type === UserFriendType.BLOCKED &&
          userFriendFrom.type === UserFriendType.FRIEND: {
          // Friend blocked
          await em.merge(UserFriend, userFriendFrom, { type: UserFriendType.BLOCKED });
          break;
        }
        case userFriend.type === UserFriendType.FRIEND &&
          userFriendFrom.type === UserFriendType.BLOCKED: {
          // Friend unblocked
          await em.merge(UserFriend, userFriendFrom, { type: UserFriendType.FRIEND });
          break;
        }
        case userFriend.type === UserFriendType.DELETED &&
          (userFriendFrom.type === UserFriendType.FRIEND ||
            userFriendFrom.type === UserFriendType.BLOCKED): {
          // Friend deleted
          await em.merge(UserFriend, userFriendFrom, { type: UserFriendType.DELETED });
          break;
        }
        case userFriend.type === UserFriendType.FRIEND &&
          userFriendFrom.type === UserFriendType.DELETED: {
          // Friend undeleted
          await em.merge(UserFriend, userFriendFrom, { type: UserFriendType.FRIEND });
          break;
        }
        default: {
          break;
        }
      }

      await UserFriendRepository.updateUnique(userFriendTo, em);
      return UserFriendRepository.updateUnique(userFriendFrom, em);
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  public deleteOrFail(userFriend: UserFriend, entityManager?: EntityManager): Promise<UserFriend> {
    const callback = async (em: EntityManager) => {
      // eslint-disable-next-line no-param-reassign
      userFriend.type = UserFriendType.DELETED;

      return this.updateOrFail(userFriend, em);
    };

    if (entityManager === undefined) return this.manager.transaction(callback);
    return callback(entityManager);
  }

  private static async saveUnique(
    userFriend: UserFriend,
    entityManager: EntityManager,
    saveOptions?: SaveOptions,
    isUpdateOperation?: boolean
  ): Promise<UserFriend> {
    const duplicateFields = new Set<Duplicate>();
    const uniqueColumns = EntityUtil.uniqueColumns(UserFriend);
    const whereConditions = uniqueColumns.map((uf) => {
      return {
        [uf]: userFriend[uf],
        ...(isUpdateOperation === true && {
          user: Not(userFriend.user),
          friend: Not(userFriend.friend),
        }),
      };
    });

    const duplicateEntities = await entityManager.find(UserFriend, {
      where: whereConditions,
      select: uniqueColumns,
    });

    duplicateEntities.forEach((_userFriend) => {
      uniqueColumns.forEach((uf) => {
        if (userFriend[uf] === _userFriend[uf]) {
          duplicateFields.add({ property: uf.toString(), value: userFriend[uf] });
        }
      });
    });

    if (
      !isUpdateOperation &&
      (await entityManager.findOne(UserFriend, {
        user: userFriend.user,
        friend: userFriend.friend,
      })) !== undefined
    ) {
      duplicateFields.add({
        property: `{ user, friend }`,
        value: { user: userFriend.user.id, friend: userFriend.friend.id },
      });
    }

    if (duplicateFields.size !== 0)
      throw new DuplicateEntityError(
        `Duplicate User Friend entity found`,
        Array.from(duplicateFields)
      );

    return entityManager.save(UserFriend, userFriend, saveOptions);
  }

  private static updateUnique(
    userFriend: UserFriend,
    entityManager: EntityManager,
    saveOptions?: SaveOptions
  ): Promise<UserFriend> {
    return this.saveUnique(userFriend, entityManager, saveOptions, true);
  }
}
