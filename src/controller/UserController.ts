// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import logger from '@app/logger';
import User from '@app/db/entity/User';
import { ResponseHelper, StatusCode } from '@app/helper';

export default class UserController {
  public static findById(req: Request, res: Response): void {
    logger.error(JSON.stringify(req?.user));
    const { id } = req.params;

    getRepository(User)
      .findOneOrFail({ id })
      .then((user) => {
        ResponseHelper.send(res, StatusCode.FOUND, user);
      })
      .catch((ex) => {
        logger.warn(`Cannot find User with id ${id} due to ${ex.message}`);
        ResponseHelper.send(res, StatusCode.NOT_FOUND);
      });
  }

  public static create(_req: Request, res: Response): void {
    ResponseHelper.send(res, StatusCode.NOT_FOUND);
  }
}
