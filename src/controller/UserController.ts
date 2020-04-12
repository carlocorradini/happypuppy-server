// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository, getCustomRepository } from 'typeorm';
import logger from '@app/logger';
import User from '@app/db/entity/User';
import UserRepository from '@app/db/repository/UserRepository';
import { DuplicateEntityError, UserNotVerifiedError } from '@app/common/error';
import { ResponseHelper, HttpStatusCode } from '@app/helper';
import { ImageService } from '@app/service';

export default class UserController {
  public static find(req: Request, res: Response): void {
    const { id } = req.params;

    getCustomRepository(UserRepository)
      .findOneAndVerifiedOrFail(id)
      .then((user) => {
        logger.info(`Found User ${user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, user);
      })
      .catch((ex) => {
        logger.warn(`Failed to find User ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound' || ex instanceof UserNotVerifiedError)
          ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static register(req: Request, res: Response): void {
    const user: User = req.app.locals.User;

    getCustomRepository(UserRepository)
      .saveOrFail(user)
      .then((newUser) => {
        logger.info(`Registered User ${newUser.id}`);

        ResponseHelper.send(res, HttpStatusCode.CREATED, { id: newUser.id });
      })
      .catch((ex) => {
        logger.warn(`Failed to register User due to ${ex.message}`);

        if (ex instanceof DuplicateEntityError)
          ResponseHelper.send(res, HttpStatusCode.CONFLICT, ex.errors);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static update(req: Request, res: Response): void {
    const user: User = req.app.locals.User;
    user.id = req.user?.id ? req.user.id : '';

    getCustomRepository(UserRepository)
      .updateOrFail(user)
      .then((upUser) => {
        logger.info(`Updated User ${upUser.id}`);
        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(`Failed to update User ${user.id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else if (ex instanceof DuplicateEntityError)
          ResponseHelper.send(res, HttpStatusCode.CONFLICT, ex.errors);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static delete(req: Request, res: Response): void {
    const id: string = req.user?.id ? req.user.id : '';

    getCustomRepository(UserRepository)
      .deleteOrFail(getRepository(User).create({ id }))
      .then(() => {
        logger.info(`Deleted User ${id}`);

        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(`Failed to delete User ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static uploadAvatar(req: Request, res: Response): void {
    const id: string = req.user?.id ? req.user.id : '';

    ImageService.upload(req.file, { folder: 'happypuppy/upload/user' })
      .then((result) => {
        logger.info(`Changed avatar for User ${id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, result);
      })
      .catch((ex) => {
        logger.error(`Failed to change avatar for User ${id} due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
