// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository, getCustomRepository } from 'typeorm';
import logger from '@app/logger';
import User from '@app/db/entity/User';
import UserRepository from '@app/db/repository/UserRepository';
import { DuplicateEntityError } from '@app/db/repository/error';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class UserController {
  public static find(req: Request, res: Response): void {
    const { id } = req.params;

    getRepository(User)
      .findOneOrFail({ id })
      .then((user) => {
        ResponseHelper.send(res, HttpStatusCode.OK, user);
      })
      .catch((ex) => {
        logger.warn(`Failed to find User with id ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static register(req: Request, res: Response): void {
    const { user } = req.app.locals;

    getCustomRepository(UserRepository)
      .saveOrFail(user)
      .then((_user) => {
        logger.info(`Registered User with id ${_user.id}`);
        ResponseHelper.send(res, HttpStatusCode.CREATED, { id: _user.id });
      })
      .catch((ex) => {
        logger.warn(`Failed to register User due to ${ex.message}`);

        if (ex instanceof DuplicateEntityError)
          ResponseHelper.send(res, HttpStatusCode.CONFLICT, ex.errors);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static update(req: Request, res: Response): void {
    const { user } = req.app.locals;
    user.id = req.user?.id;

    getCustomRepository(UserRepository)
      .updateOrFail(user)
      .then((_user) => {
        logger.info(`Updated User with id ${_user.id}`);
        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(`Failed to update User due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static delete(req: Request, res: Response): void {
    const id = req.user?.id;

    getCustomRepository(UserRepository)
      .deleteOrFail(getRepository(User).create({ id }))
      .then(() => {
        logger.info(`Deleted User with id ${id}`);
        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(`Failed to delete User due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
