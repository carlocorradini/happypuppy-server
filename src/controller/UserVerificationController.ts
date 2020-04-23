// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getCustomRepository, getManager } from 'typeorm';
import logger from '@app/logger';
import User from '@app/db/entity/User';
// eslint-disable-next-line no-unused-vars
import UserVerification from '@app/db/entity/UserVerification';
import UserVerificationRepository from '@app/db/repository/UserVerificationRepository';
import {
  UserAlreadyVerifiedError,
  EntityNotFoundError,
  DataMismatchError,
} from '@app/common/error';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class UserController {
  public static verify(req: Request, res: Response): void {
    const userVerification: UserVerification = req.app.locals.UserVerification;
    userVerification.user = getManager().create(User, {
      id: (userVerification.user as unknown) as string,
    });

    getCustomRepository(UserVerificationRepository)
      .verifyOrFail(userVerification)
      .then((token) => {
        logger.info(`User Verification succeeded for ${userVerification.user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, token);
      })
      .catch((ex) => {
        logger.warn(`Failed to Verify User ${userVerification.user.id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound' || ex instanceof EntityNotFoundError)
          ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else if (ex instanceof UserAlreadyVerifiedError)
          ResponseHelper.send(res, HttpStatusCode.FORBIDDEN);
        else if (ex instanceof DataMismatchError)
          ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static resend(req: Request, res: Response): void {
    const { id } = req.params;

    getManager()
      .findOneOrFail(User, id)
      .then((user) => getCustomRepository(UserVerificationRepository).verifyResendOrFail(user))
      .then((userVerification) => {
        logger.info(`Resended User Verification for ${userVerification.user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(`Failed to resend User Verification for ${id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound' || ex instanceof EntityNotFoundError)
          ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else if (ex instanceof UserAlreadyVerifiedError)
          ResponseHelper.send(res, HttpStatusCode.FORBIDDEN);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
