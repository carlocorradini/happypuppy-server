/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import {
  getRepository,
  getCustomRepository,
  QueryFailedError,
  Like,
  Between,
  MoreThanOrEqual,
} from 'typeorm';
import { validateOrReject } from 'class-validator';
import FilmRepository from '../db/repository/FilmRepository';
import Film from '../db/entity/Film';
import { APIUtil } from '../utils';
import { StatusCode, generateResponse } from '../response';
import { InvalidParamError } from '../utils/errors';

export default class FilmController {
  public static async getOne(req: Request, res: Response) {
    let response: { statusCode: StatusCode; data: any } = {
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      data: '',
    };

    try {
      const id = await APIUtil.id(req.params.id);
      const film: Film = await getRepository(Film).findOneOrFail({ id }, { loadRelationIds: true });

      response = { statusCode: StatusCode.OK, data: film };
    } catch (ex) {
      if (ex instanceof InvalidParamError) {
        response = { statusCode: StatusCode.BAD_REQUEST, data: ex.message };
      } else if (ex instanceof Error && ex.name === 'EntityNotFound') {
        response = {
          statusCode: StatusCode.NOT_FOUND,
          data: `Cannot find a Film with the specified identifier`,
        };
      } else if (ex instanceof QueryFailedError) {
        response = { statusCode: StatusCode.INTERNAL_SERVER_ERROR, data: ex.message };
      }
    } finally {
      generateResponse(res, response.statusCode, response.data);
    }
  }

  public static async getAll(req: Request, res: Response) {
    let response: { statusCode: StatusCode; data: any } = {
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      data: '',
    };

    try {
      const limit = await APIUtil.limit(req.query.limit);
      const offset = await APIUtil.offset(req.query.offset);
      const { title, release_year, rating } = req.query;

      if (release_year !== undefined && Number.isNaN(parseInt(release_year, 10)))
        throw new InvalidParamError(`Invalid release_year, received ${release_year}`);
      if (rating !== undefined && Number.isNaN(parseInt(rating, 10)))
        throw new InvalidParamError(`Invalid rating, received ${rating}`);

      const films: Film[] = await getRepository(Film).find({
        take: limit,
        skip: offset,
        loadRelationIds: true,
        where: {
          ...(title !== undefined && { title: Like(`${title}%`) }),
          ...(release_year !== undefined && {
            release_date: Between(
              new Date(`${release_year}-01-01`),
              new Date(`${release_year}-12-31`)
            ),
          }),
          ...(rating !== undefined && { rating: MoreThanOrEqual(rating) }),
        },
      });

      response = { statusCode: StatusCode.OK, data: films };
    } catch (ex) {
      if (ex instanceof InvalidParamError) {
        response = { statusCode: StatusCode.BAD_REQUEST, data: ex.message };
      } else if (ex instanceof QueryFailedError) {
        response = { statusCode: StatusCode.INTERNAL_SERVER_ERROR, data: ex.message };
      }
    } finally {
      generateResponse(res, response.statusCode, response.data);
    }
  }

  public static async add(req: Request, res: Response) {
    let response: { statusCode: StatusCode; data: any } = {
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      data: '',
    };

    try {
      let film: Film = await getCustomRepository(FilmRepository).createFromBodyOrFail(req.body);
      film = await getRepository(Film).save(film);

      response = { statusCode: StatusCode.CREATED, data: film };
    } catch (ex) {
      if (Array.isArray(ex)) {
        response = { statusCode: StatusCode.BAD_REQUEST, data: ex };
      } else if (ex instanceof QueryFailedError) {
        response = { statusCode: StatusCode.INTERNAL_SERVER_ERROR, data: ex.message };
      }
    } finally {
      generateResponse(res, response.statusCode, response.data);
    }
  }

  public static async delete(req: Request, res: Response) {
    const id = await APIUtil.id(req.params.id);
    const filmRepository = await getRepository(Film);
    let response: { statusCode: StatusCode; data: any } = {
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      data: '',
    };

    try {
      const film: Film = await filmRepository.findOneOrFail({ id });
      await filmRepository.delete({ id: film.id });

      response = { statusCode: StatusCode.ACCEPTED, data: film };
    } catch (ex) {
      if (ex instanceof Error && ex.name === 'EntityNotFound') {
        response = { statusCode: StatusCode.NOT_FOUND, data: `Cannot find a Film with id ${id}` };
      } else if (ex instanceof QueryFailedError) {
        response = { statusCode: StatusCode.INTERNAL_SERVER_ERROR, data: ex.message };
      }
    } finally {
      generateResponse(res, response.statusCode, response.data);
    }
  }

  public static async update(req: Request, res: Response) {
    const id = await APIUtil.id(req.params.id);
    const filmRepository = await getRepository(Film);
    const newFilm: Film = await getCustomRepository(FilmRepository).createFromBody(req.body);
    let response: { statusCode: StatusCode; data: any } = {
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      data: '',
    };

    try {
      const film: Film = await filmRepository.findOneOrFail({ id });
      await filmRepository.merge(film, newFilm);
      await validateOrReject(film, {
        forbidUnknownValues: true,
        validationError: {
          target: false,
        },
      });
      await filmRepository.save(film);

      response = { statusCode: StatusCode.OK, data: film };
    } catch (ex) {
      if (ex instanceof Error && ex.name === 'EntityNotFound') {
        response = { statusCode: StatusCode.NOT_FOUND, data: `Cannot find a Film with id ${id}` };
      } else if (Array.isArray(ex)) {
        response = { statusCode: StatusCode.BAD_REQUEST, data: ex };
      } else if (ex instanceof QueryFailedError) {
        response = { statusCode: StatusCode.INTERNAL_SERVER_ERROR, data: ex.message };
      }
    } finally {
      generateResponse(res, response.statusCode, response.data);
    }
  }
}
