// eslint-disable-next-line no-unused-vars
import { Request } from 'express';
import { Repository, EntityRepository } from 'typeorm';
import { validate } from 'class-validator';
import User from '@app/db/entity/User';

@EntityRepository(User)
export default class FilmRepository extends Repository<User> {
  async createOrFail(req: Request): Promise<User> {
    const user: User = await super.create(req.body)[0];
    const errors = await validate(user, {
      forbidUnknownValues: true,
      validationError: {
        target: false,
      },
    });

    return errors.length === 0 ? Promise.resolve(user) : Promise.reject(user);
  }
}
