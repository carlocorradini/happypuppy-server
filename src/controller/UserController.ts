// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getCustomRepository, getManager } from 'typeorm';
import logger from '@app/logger';
import User from '@app/db/entity/User';
import UserRepository from '@app/db/repository/UserRepository';
import UserPasswordResetRepository from '@app/db/repository/UserPasswordResetRepository';
import {
  DuplicateEntityError,
  UserNotVerifiedError,
  InvalidTokenException,
} from '@app/common/error';
import { ResponseHelper, HttpStatusCode, JWTHelper } from '@app/helper';
// eslint-disable-next-line no-unused-vars
import UserPasswordReset from '@app/db/entity/UserPasswordReset';

export default class UserController {
  public static find(req: Request, res: Response): void {
    const { id } = req.params;

    getCustomRepository(UserRepository)
      .findOneAndVerifiedOrFail(id, { loadRelationIds: true })
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

  public static create(req: Request, res: Response): void {
    const user: User = req.app.locals.User;

    getCustomRepository(UserRepository)
      .saveOrFail(user)
      .then((newUser) => {
        logger.info(`Created User ${newUser.id}`);

        ResponseHelper.send(res, HttpStatusCode.CREATED, newUser.id);
      })
      .catch((ex) => {
        logger.warn(`Failed to create User due to ${ex.message}`);

        if (ex instanceof DuplicateEntityError)
          ResponseHelper.send(res, HttpStatusCode.CONFLICT, ex.errors);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static signIn(req: Request, res: Response): void {
    const user: User = getManager().create(User, {
      username: req.body.username,
      password: req.body.password,
    });

    getCustomRepository(UserRepository)
      .signInOrFail(user)
      .then(async (token) => {
        logger.info(
          `Authentication with credentials succeeded for User ${(await JWTHelper.verify(token)).id}`
        );

        ResponseHelper.send(res, HttpStatusCode.OK, token);
      })
      .catch((ex) => {
        logger.warn(`Failed to authenticate User with credentials due to ${ex.message}`);

        if (ex instanceof UserNotVerifiedError) ResponseHelper.send(res, HttpStatusCode.FORBIDDEN);
        else ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
      });
  }

  public static passwordResetRequest(req: Request, res: Response): void {
    const { email } = req.params;

    getManager()
      .findOneOrFail(User, { where: { email }, select: ['id', 'username', 'email'] })
      .then((user) => getCustomRepository(UserPasswordResetRepository).request(user))
      .then((userPasswordReset) => {
        logger.info(`Request reset password sended for User ${userPasswordReset.user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(`Failed sending reset password request for User ${email} due to ${ex.message}`);

        // Return 200 if NOT FOUND due to security risks
        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.OK);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static passwordReset(req: Request, res: Response): void {
    const userPasswordReset: UserPasswordReset = req.app.locals.UserPasswordReset;

    getCustomRepository(UserPasswordResetRepository)
      .change(userPasswordReset)
      .then((user) => {
        logger.info(`Updated User ${user.id} password`);

        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(
          `Failed to update User ${userPasswordReset.token} password due to ${ex.message}`
        );

        if (ex.name === 'EntityNotFound' || ex instanceof InvalidTokenException)
          ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
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

  public static updateAvatar(req: Request, res: Response): void {
    const id: string = req.user?.id ? req.user.id : '';

    getCustomRepository(UserRepository)
      .updateAvataOrFail(getManager().create(User, { id }), req.file)
      .then((user) => {
        logger.info(`Changed avatar for User ${user.id} to ${user.avatar}`);

        ResponseHelper.send(res, HttpStatusCode.OK, { avatar: user.avatar });
      })
      .catch((ex) => {
        logger.error(`Failed to change avatar for User ${id} due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static delete(req: Request, res: Response): void {
    const id: string = req.user?.id ? req.user.id : '';

    getCustomRepository(UserRepository)
      .deleteOrFail(getManager().create(User, { id }))
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
}
