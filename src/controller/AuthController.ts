// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getCustomRepository, getManager } from 'typeorm';
import logger from '@app/logger';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';
// eslint-disable-next-line no-unused-vars
import UserVerification from '@app/db/entity/UserVerification';
import UserRepository from '@app/db/repository/UserRepository';
import UserVerificationRepository from '@app/db/repository/UserVerificationRepository';
import {
  UserNotVerifiedError,
  UserAlreadyVerifiedError,
  EntityNotFoundError,
  DataMismatchError,
} from '@app/common/error';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class AuthController {
  public static signIn(req: Request, res: Response): void {
    const user: User = getManager().create(User, {
      username: req.body.username,
      password: req.body.password,
    });

    getCustomRepository(UserRepository)
      .signInOrFail(user)
      .then((token) => {
        logger.info(`Authentication with credentials succeeded for User ${user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, { token });
      })
      .catch((ex) => {
        logger.warn(`Failed to authenticate User with credentials due to ${ex.message}`);

        if (ex instanceof UserNotVerifiedError) ResponseHelper.send(res, HttpStatusCode.FORBIDDEN);
        else ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
      });
  }

  public static verify(req: Request, res: Response): void {
    const userVerification: UserVerification = req.app.locals.UserVerification;

    getCustomRepository(UserVerificationRepository)
      .verifyOrFail(userVerification)
      .then((token) => {
        logger.info(`Verification succeeded for User with id ${userVerification.user_id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, { token });
      })
      .catch((ex) => {
        logger.warn(`Failed to verify User due to ${ex.message}`);

        if (ex.name === 'EntityNotFound' || ex instanceof EntityNotFoundError)
          ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else if (ex instanceof UserAlreadyVerifiedError)
          ResponseHelper.send(res, HttpStatusCode.FORBIDDEN);
        else if (ex instanceof DataMismatchError) {
          ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
        } else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
