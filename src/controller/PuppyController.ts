// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository, getCustomRepository, getManager } from 'typeorm';
import logger from '@app/logger';
import Puppy from '@app/db/entity/Puppy';
import PuppyRepository from '@app/db/repository/PuppyRepository';
import { ResponseHelper, HttpStatusCode } from '@app/helper';
import { DuplicateEntityError } from '@app/common/error';
import User from '@app/db/entity/User';

export default class PuppyController {
  public static find(req: Request, res: Response): void {
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

        ResponseHelper.send(res, HttpStatusCode.OK, { avatar: upPuppy.avatar });
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
