// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import logger from '@app/logger';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';
// eslint-disable-next-line no-unused-vars
import UserVerification from '@app/db/entity/UserVerification';
import UserRepository from '@app/db/repository/UserRepository';
import UserVerificationRepository from '@app/db/repository/UserVerificationRepository';
import {
  UserNotVerifiedError,
  EntityNotFoundError,
  DataMismatchError,
} from '@app/db/repository/error';
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
        logger.info(`Authentication with credentials succeeded for User with id ${user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, { token });
      })
      .catch((ex) => {
        logger.warn(`Failed to authenticate with credentials due to ${ex.message}`);

        if (ex instanceof UserNotVerifiedError) ResponseHelper.send(res, HttpStatusCode.FORBIDDEN);
        else ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
      });
  }

  public static verify(req: Request, res: Response): void {
    const userVerification: UserVerification = req.app.locals.UserVerification;

    getCustomRepository(UserVerificationRepository)
      .verifyOrFail(userVerification)
      .then((user) => {
        return JWTUtil.sign({
          id: user.id,
          role: user.role,
        });
      })
      .then((token) => {
        logger.info(`Verification succeeded for User with id ${userVerification.user_id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, { token });
      })
      .catch((ex) => {
        logger.warn(`Failed to verify User due to ${ex.message}`);

        if (ex.name === 'EntityNotFound' || ex instanceof EntityNotFoundError)
          ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else if (ex instanceof DataMismatchError) {
          ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
        } else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
