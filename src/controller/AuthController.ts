// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import logger from '@app/logger';
import User from '@app/db/entity/User';
import { CryptUtil, JWTUtil } from '@app/utils';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class AuthController {
  public static signIn(req: Request, res: Response): void {
    let user: User;

    getRepository(User)
      .findOneOrFail({ username: req.body.username }, { select: ['id', 'username', 'password'] })
      .then((_user) => {
        user = _user;
        return CryptUtil.compareOrFail(req.body.password, user.password);
      })
      .then(async () => {
        ResponseHelper.send(res, HttpStatusCode.OK, {
          token: await JWTUtil.sign({
            id: user.id,
            username: user.username,
          }),
        });
      })
      .catch((ex) => {
        logger.warn(`Authentication with credentials failed due to ${ex.message}`);
        ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
      });
  }
}
