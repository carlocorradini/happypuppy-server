// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import logger from '@app/logger';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';
import UserRepository from '@app/db/repository/UserRepository';
import { UserNotVerifiedError } from '@app/db/repository/error';
import { CryptUtil, JWTUtil } from '@app/utils';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class AuthController {
  public static signIn(req: Request, res: Response): void {
    let user: User;

    getCustomRepository(UserRepository)
      .findOneAndVerifiedOrFail(
        { username: req.body.username },
        { select: ['id', 'username', 'password'] }
      )
      .then((_user) => {
        user = _user;
        return CryptUtil.compareOrFail(req.body.password, user.password);
      })
      .then(() => {
        return JWTUtil.sign({
          id: user.id,
          role: user.role,
        });
      })
      .then((token) => {
        ResponseHelper.send(res, HttpStatusCode.OK, { token });
      })
      .catch((ex) => {
        logger.warn(`Authentication with credentials failed due to ${ex.message}`);

        if (ex instanceof UserNotVerifiedError) ResponseHelper.send(res, HttpStatusCode.FORBIDDEN);
        else ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
      });
  }

  public static verify(req: Request, res: Response): void {
    const { id } = req.params;

    getCustomRepository(UserRepository)
      .updateOrFail(getRepository(User).create({ id, verified: false }))
      .then((user) => {
        return JWTUtil.sign({
          id: user.id,
          role: user.role,
        });
      })
      .then((token) => {
        ResponseHelper.send(res, HttpStatusCode.OK, { token });
      })
      .catch((ex) => {
        logger.warn(`Failed to verify User with id ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
