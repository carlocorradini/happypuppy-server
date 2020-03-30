/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository, getCustomRepository, QueryFailedError, Like, Between } from 'typeorm';
import { validateOrReject } from 'class-validator';
import { InvalidParamError } from '../utils/errors';
import ActorRepository from '../db/repository/ActorRepository';
import Actor from '../db/entity/Actor';
import { APIUtil } from '../utils';
import { StatusCode, generateResponse } from '../response';

export default class ActorController {
  public static async getOne(req: Request, res: Response) {
    let response: { statusCode: StatusCode; data: any } = {
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      data: '',
    };

    try {
      const id = await APIUtil.id(req.params.id);
      const actor: Actor = await getRepository(Actor).findOneOrFail(
        { id },
        { loadRelationIds: true }
      );

      response = { statusCode: StatusCode.OK, data: actor };
    } catch (ex) {
      if (ex instanceof InvalidParamError) {
        response = { statusCode: StatusCode.BAD_REQUEST, data: ex.message };
      } else if (ex instanceof Error && ex.name === 'EntityNotFound') {
        response = {
          statusCode: StatusCode.NOT_FOUND,
          data: `Cannot find an Actor with the specified identifier`,
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
      const { name, surname, birth_year, death_year, gender } = req.query;

      if (birth_year !== undefined && Number.isNaN(parseInt(birth_year, 10)))
        throw new InvalidParamError(`Invalid birth_year, received ${birth_year}`);
      if (death_year !== undefined && Number.isNaN(parseInt(death_year, 10)))
        throw new InvalidParamError(`Invalid death_year, received ${death_year}`);
      if (gender !== undefined && gender !== 'M' && gender !== 'F')
        throw new InvalidParamError(`Invalid gender, received ${gender}`);

      const actors: Actor[] = await getRepository(Actor).find({
        take: limit,
        skip: offset,
        loadRelationIds: true,
        where: {
          ...(name !== undefined && { name: Like(`${name}%`) }),
          ...(surname !== undefined && { surname: Like(`${surname}%`) }),
          ...(gender !== undefined && { gender: Like(`${gender}%`) }),
          ...(birth_year !== undefined && {
            birth_date: Between(new Date(`${birth_year}-01-01`), new Date(`${birth_year}-12-31`)),
          }),
          ...(death_year !== undefined && {
            death_date: Between(new Date(`${death_year}-01-01`), new Date(`${death_year}-12-31`)),
          }),
        },
      });

      response = { statusCode: StatusCode.OK, data: actors };
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
      let actor: Actor = await getCustomRepository(ActorRepository).createFromBodyOrFail(req.body);
      actor = await getRepository(Actor).save(actor);

      response = { statusCode: StatusCode.CREATED, data: actor };
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
    const actorRepository = await getRepository(Actor);
    let response: { statusCode: StatusCode; data: any } = {
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      data: '',
    };

    try {
      const actor: Actor = await actorRepository.findOneOrFail({ id });
      await actorRepository.delete({ id: actor.id });

      response = { statusCode: StatusCode.ACCEPTED, data: actor };
    } catch (ex) {
      if (ex instanceof Error && ex.name === 'EntityNotFound') {
        response = { statusCode: StatusCode.NOT_FOUND, data: `Cannot find an Actor with id ${id}` };
      } else if (ex instanceof QueryFailedError) {
        response = { statusCode: StatusCode.INTERNAL_SERVER_ERROR, data: ex.message };
      }
    } finally {
      generateResponse(res, response.statusCode, response.data);
    }
  }

  public static async update(req: Request, res: Response) {
    const id = await APIUtil.id(req.params.id);
    const actorRepository = await getRepository(Actor);
    const newActor: Actor = await getCustomRepository(ActorRepository).createFromBody(req.body);
    let response: { statusCode: StatusCode; data: any } = {
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      data: '',
    };

    try {
      const actor: Actor = await actorRepository.findOneOrFail({ id });
      await actorRepository.merge(actor, newActor);
      await validateOrReject(actor, {
        forbidUnknownValues: true,
        validationError: {
          target: false,
        },
      });
      await actorRepository.save(actor);

      response = { statusCode: StatusCode.OK, data: actor };
    } catch (ex) {
      if (ex instanceof Error && ex.name === 'EntityNotFound') {
        response = { statusCode: StatusCode.NOT_FOUND, data: `Cannot find an Actor with id ${id}` };
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
