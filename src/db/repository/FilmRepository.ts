// eslint-disable-next-line no-unused-vars, import/no-unresolved
import { Dictionary } from 'express-serve-static-core';
import { Repository, EntityRepository } from 'typeorm';
import { validate } from 'class-validator';
import Film from '../entity/Film';
import Actor from '../entity/Actor';

@EntityRepository(Film)
export default class FilmRepository extends Repository<Film> {
  async createFromBody(body: Dictionary<string>): Promise<Film> {
    const film: Film = this.create(body);

    if (body.actors) {
      film.actors = Object.keys(body.actors).map((key: string) => {
        const actor: Actor = new Actor();
        actor.id = parseInt(body.actors[parseInt(key, 10)], 10);
        return actor;
      });
    }

    return new Promise((resolve) => {
      resolve(film);
    });
  }

  async createFromBodyOrFail(body: Dictionary<string>): Promise<Film> {
    const film: Film = await this.createFromBody(body);

    const errors = await validate(film, {
      forbidUnknownValues: true,
      validationError: {
        target: false,
      },
    });
    return new Promise((resolve, reject) => {
      if (errors.length > 0) {
        reject(errors);
      } else {
        resolve(film);
      }
    });
  }
}
