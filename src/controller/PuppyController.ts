/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository, getCustomRepository, getManager, Between } from 'typeorm';
import moment from 'moment';
import logger from '@app/logger';
import Puppy from '@app/db/entity/Puppy';
import PuppyRepository from '@app/db/repository/PuppyRepository';
import { ResponseHelper, HttpStatusCode } from '@app/helper';
import { DuplicateEntityError } from '@app/common/error';
import User from '@app/db/entity/User';
import { StringUtil, ArrayUtil } from '@app/util';

export default class PuppyController {
  public static find(req: Request, res: Response): void {
    const {
      limit,
      offset,
      sort,
      sort_order,
      id,
      name,
      gender,
      date_of_birth,
      weight,
      user,
      specie,
      breeds,
      personalities,
      created_at,
    } = req.query;

    const breedsArray: number[] = StringUtil.toNumberArray(breeds as string);
    const personalitiesArray: number[] = StringUtil.toNumberArray(personalities as string);

    getManager()
      .find(Puppy, {
        ...(limit !== undefined && { take: (limit as unknown) as number }),
        ...(offset !== undefined && { skip: (offset as unknown) as number }),
        ...(sort !== undefined &&
          sort_order !== undefined && {
            order: {
              [sort as keyof Puppy]: sort_order,
            },
          }),
        loadRelationIds: true,
        where: {
          ...(id !== undefined && { id }),
          ...(name !== undefined && { name }),
          ...(gender !== undefined && { gender }),
          ...(date_of_birth !== undefined && { date_of_birth }),
          ...(weight !== undefined && { weight }),
          ...(user !== undefined && { user }),
          ...(specie !== undefined && { specie }),
          ...(created_at !== undefined && {
            created_at: Between(
              moment(`${created_at}T00:00:00.000`),
              moment(`${created_at}T23:59:59.999`)
            ),
          }),
        },
      })
      .then((puppies) => {
        // eslint-disable-next-line no-param-reassign
        puppies = puppies.filter(
          (puppy) =>
            ArrayUtil.contains(puppy.breeds, breedsArray) &&
            ArrayUtil.contains(puppy.personalities, personalitiesArray)
        );

        logger.info(`Found ${puppies.length} Puppies`);

        ResponseHelper.send(res, HttpStatusCode.OK, puppies);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Puppies due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static findById(req: Request, res: Response): void {
    const { id } = req.params;

    getRepository(Puppy)
      .findOneOrFail(id, { loadRelationIds: true })
      .then((puppy) => {
        logger.info(`Found Puppy ${puppy.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, puppy);
      })
      .catch((ex) => {
        logger.warn(`Failed to find Puppy ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static create(req: Request, res: Response): void {
    const puppy: Puppy = req.app.locals.Puppy;
    puppy.user = getManager().create(User, { id: req.user?.id ? req.user.id : '' });

    getCustomRepository(PuppyRepository)
      .saveOrFail(puppy)
      .then((newPuppy) => {
        logger.info(`Created Puppy ${newPuppy.id}`);

        ResponseHelper.send(res, HttpStatusCode.CREATED, newPuppy.id);
      })
      .catch((ex) => {
        logger.warn(`Failed to create Puppy due to ${ex.message}`);

        if (ex instanceof DuplicateEntityError)
          ResponseHelper.send(res, HttpStatusCode.CONFLICT, ex.errors);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static update(req: Request, res: Response): void {
    const puppy: Puppy = req.app.locals.Puppy;
    puppy.id = Number.parseInt(req.params.id, 10);
    puppy.user = getManager().create(User, { id: req.user?.id ? req.user.id : '' });

    getCustomRepository(PuppyRepository)
      .updateOrFail(puppy)
      .then((upPuppy) => {
        logger.info(`Updated Puppy ${upPuppy.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(`Failed to update Puppy ${puppy.id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else if (ex instanceof DuplicateEntityError)
          ResponseHelper.send(res, HttpStatusCode.CONFLICT, ex.errors);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static updateAvatar(req: Request, res: Response): void {
    const puppy: Puppy = getManager().create(Puppy, {
      id: Number.parseInt(req.params.id, 10),
      user: getManager().create(User, { id: req.user?.id ? req.user.id : '' }),
    });

    getCustomRepository(PuppyRepository)
      .updateAvataOrFail(puppy, req.file)
      .then((upPuppy) => {
        logger.info(`Changed avatar for Puppy ${upPuppy.id} to ${upPuppy.avatar}`);

        ResponseHelper.send(res, HttpStatusCode.OK, upPuppy.avatar);
      })
      .catch((ex) => {
        logger.error(`Failed to change avatar for Puppy ${puppy.id} due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static delete(req: Request, res: Response): void {
    const puppy: Puppy = getManager().create(Puppy, {
      id: Number.parseInt(req.params.id, 10),
      user: getManager().create(User, { id: req.user?.id ? req.user.id : '' }),
    });

    getCustomRepository(PuppyRepository)
      .deleteOrFail(puppy)
      .then(() => {
        logger.info(`Deleted Puppy ${puppy.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(`Failed to delete Puppy ${puppy.id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
