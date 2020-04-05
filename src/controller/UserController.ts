// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository, getCustomRepository } from 'typeorm';
import logger from '@app/logger';
import User from '@app/db/entity/User';
import UserRepository from '@app/db/repository/UserRepository';
import { DuplicateError } from '@app/db/repository/error';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class UserController {
  public static findById(req: Request, res: Response): void {
    const { id } = req.params;

    getRepository(User)
      .findOneOrFail({ id })
      .then((user) => {
        ResponseHelper.send(res, HttpStatusCode.FOUND, user);
      })
      .catch((ex) => {
        logger.warn(`Cannot find User with id ${id} due to ${ex.message}`);
        ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
      });
  }

  public static register(req: Request, res: Response): void {
    const user: User = req.app.locals?.user;

    getCustomRepository(UserRepository)
      .saveUniqueOrFail(user)
      .then((_user) => {
        logger.info(`Added new User with id ${_user.id}`);
        ResponseHelper.send(res, HttpStatusCode.CREATED, { id: _user.id });
      })
      .catch((ex) => {
        logger.warn(`Cannot add new User due to ${ex.message}`);

        if (ex instanceof DuplicateError)
          ResponseHelper.send(res, HttpStatusCode.CONFLICT, { errors: ex.errors });
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
