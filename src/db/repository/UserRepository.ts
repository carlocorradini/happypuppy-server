// eslint-disable-next-line no-unused-vars, import/no-unresolved
import { Dictionary } from 'express-serve-static-core';
import { Repository, EntityRepository } from 'typeorm';
import { validate } from 'class-validator';
import User from '../entity/User';

@EntityRepository(User)
export default class FilmRepository extends Repository<User> {
  async createFromBody(body: Dictionary<string>): Promise<User> {
    const user: User = this.create(body);

    return new Promise((resolve) => {
      resolve(user);
    });
  }

  async createFromBodyOrFail(body: Dictionary<string>): Promise<User> {
    const user: User = await this.createFromBody(body);

    const errors = await validate(user, {
      forbidUnknownValues: true,
      validationError: {
        target: false,
      },
    });
    return new Promise((resolve, reject) => {
      if (errors.length > 0) {
        reject(errors);
      } else {
        resolve(user);
      }
    });
  }
}
