// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getManager, getCustomRepository } from 'typeorm';
import UserFriend from '@app/db/entity/UserFriend';
import User from '@app/db/entity/User';
import logger from '@app/logger';
import { ResponseHelper, HttpStatusCode } from '@app/helper';
import UserFriendRepository from '@app/db/repository/UserFriendRepository';
import { DuplicateEntityError } from '@app/common/error';

export default class UserFriendController {
  public static all(req: Request, res: Response): void {
    const user: User = getManager().create(User, { id: req.user?.id ? req.user.id : '' });

    getManager()
      .find(UserFriend, {
        where: { user },
        loadRelationIds: true,
      })
      .then((userFriends) => {
        logger.info(`Found ${userFriends.length} User Friends for ${user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, userFriends);
      })
      .catch((ex) => {
        logger.warn(`Failed to find User Friends for ${user.id} due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static find(req: Request, res: Response): void {
    const user: User = getManager().create(User, { id: req.user?.id ? req.user.id : '' });
    const friend: User = getManager().create(User, { id: req.params.id });

    getManager()
      .findOneOrFail(UserFriend, {
        where: { user, friend },
        loadRelationIds: true,
      })
      .then((userFriend) => {
        logger.info(`Found User Friend ${userFriend.friend} of ${user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, userFriend);
      })
      .catch((ex) => {
        logger.warn(`Failed to find User Friend ${friend.id} due to ${ex.message}`);

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static create(req: Request, res: Response): void {
    const userFriend: UserFriend = req.app.locals.UserFriend;
    userFriend.user = getManager().create(User, { id: req.user?.id ? req.user.id : '' });
    userFriend.friend = getManager().create(User, { id: (userFriend.friend as unknown) as string });

    getCustomRepository(UserFriendRepository)
      .saveOrFail(userFriend)
      .then((newUserFriend) => {
        logger.info(`Created User Friend ${newUserFriend.friend.id} for ${newUserFriend.user.id}`);

        ResponseHelper.send(res, HttpStatusCode.CREATED);
      })
      .catch((ex) => {
        logger.warn(
          `Failed to create User Friend ${userFriend.friend.id} for ${userFriend.user.id} due to ${ex.message}`
        );

        if (ex instanceof DuplicateEntityError)
          ResponseHelper.send(res, HttpStatusCode.CONFLICT, ex.errors);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static update(req: Request, res: Response): void {
    const userFriend: UserFriend = req.app.locals.UserFriend;
    userFriend.user = getManager().create(User, { id: req.user?.id ? req.user.id : '' });
    userFriend.friend = getManager().create(User, { id: req.params.id });

    getCustomRepository(UserFriendRepository)
      .updateOrFail(userFriend)
      .then((upUserFriend) => {
        logger.info(`Updated User Friend ${upUserFriend.friend.id} for ${upUserFriend.user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(
          `Failed to update User Friend ${userFriend.friend.id} for ${userFriend.user.id} due to ${ex.message}`
        );

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else if (ex instanceof DuplicateEntityError)
          ResponseHelper.send(res, HttpStatusCode.CONFLICT, ex.errors);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
