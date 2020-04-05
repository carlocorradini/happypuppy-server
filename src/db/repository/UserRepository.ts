import { AbstractRepository, EntityRepository } from 'typeorm';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';
// eslint-disable-next-line no-unused-vars
import DuplicateError, { Duplicate } from './error/DuplicateError';

@EntityRepository(User)
export default class UserRepository extends AbstractRepository<User> {
  public saveUniqueOrFail(user: User): Promise<User> {
    return this.repository
      .find({
        where: [{ username: user.username }, { email: user.email }],
        select: ['username', 'email'],
      })
      .then((users) => {
        const fields = new Set<Duplicate>();

        users.forEach((_user) => {
          if (user.username === _user.username) {
            fields.add({ property: 'username', value: user.username });
          }
          if (user.email === _user.email) {
            fields.add({ property: 'email', value: user.email });
          }
        });

        if (fields.size !== 0) throw new DuplicateError('Duplicate User found', Array.from(fields));
        return this.repository.save(user);
      });
  }
}
