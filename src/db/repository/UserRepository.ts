// eslint-disable-next-line no-unused-vars
import { AbstractRepository, EntityRepository, DeleteResult } from 'typeorm';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';
// eslint-disable-next-line no-unused-vars
import DuplicateEntityError, { Duplicate } from './error/DuplicateEntityError';

@EntityRepository(User)
export default class UserRepository extends AbstractRepository<User> {
  public saveOrFail(user: User): Promise<User> {
    return this.manager.transaction(async (entityManager) => {
      const fields = new Set<Duplicate>();
      const users = await entityManager.find(User, {
        where: [{ username: user.username }, { email: user.email }],
        select: ['username', 'email'],
      });

      users.forEach((_user) => {
        if (user.username === _user.username) {
          fields.add({ property: 'username', value: user.username });
        }
        if (user.email === _user.email) {
          fields.add({ property: 'email', value: user.email });
        }
      });

      if (fields.size !== 0)
        throw new DuplicateEntityError('Duplicate User found', Array.from(fields));
      return entityManager.save(User, user);
    });
  }

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
