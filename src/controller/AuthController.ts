// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
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
      .then(async () => {
        ResponseHelper.send(res, HttpStatusCode.OK, {
          token: await JWTUtil.sign({
            id: user.id,
            role: user.role,
          }),
        });
      })
      .catch((ex) => {
        logger.warn(`Authentication with credentials failed due to ${ex.message}`);

        if (ex instanceof UserNotVerifiedError) ResponseHelper.send(res, HttpStatusCode.FORBIDDEN);
        else ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
      });
  }
}
