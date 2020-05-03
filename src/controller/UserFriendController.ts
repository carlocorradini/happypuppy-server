/* eslint-disable camelcase */
// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getManager, getCustomRepository, Between } from 'typeorm';
import moment from 'moment';
import UserFriend from '@app/db/entity/UserFriend';
import User from '@app/db/entity/User';
import logger from '@app/logger';
import { ResponseHelper, HttpStatusCode } from '@app/helper';
import UserFriendRepository from '@app/db/repository/UserFriendRepository';
import { DuplicateEntityError } from '@app/common/error';

export default class UserFriendController {
  public static find(req: Request, res: Response): void {
    const { limit, offset, sort, sort_order, type, created_at } = req.query;

    const user: User = getManager().create(User, { id: req.user?.id ? req.user.id : '' });
    const friend: User | undefined =
      req.query.friend !== undefined
        ? getManager().create(User, { id: req.query.friend as string })
        : undefined;

    getManager()
      .find(UserFriend, {
        ...(limit !== undefined && { take: (limit as unknown) as number }),
        ...(offset !== undefined && { skip: (offset as unknown) as number }),
        ...(sort !== undefined &&
          sort_order !== undefined && {
            order: {
              [sort as keyof UserFriend]: sort_order,
            },
          }),
        loadRelationIds: true,
        where: {
          user,
          ...(friend !== undefined && { friend }),
          ...(type !== undefined && { type }),
          ...(created_at !== undefined && {
            created_at: Between(
              moment(`${created_at}T00:00:00.000`),
              moment(`${created_at}T23:59:59.999`)
            ),
          }),
        },
      })
      .then((userFriends) => {
        logger.info(`Found ${userFriends.length} User Friends of ${user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, userFriends);
      })
      .catch((ex) => {
        logger.warn(`Failed to find User Friends of ${user.id} due to ${ex.message}`);

        ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static findById(req: Request, res: Response): void {
    const user: User = getManager().create(User, { id: req.user?.id ? req.user.id : '' });
    const friend: User = getManager().create(User, { id: req.params.id });

    getManager()
      .findOneOrFail(
        UserFriend,
        {
          user,
          friend,
        },
        {
          loadRelationIds: true,
        }
      )
      .then((userFriend) => {
        logger.info(`Found User Friend ${userFriend.friend} of ${user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK, userFriend);
      })
      .catch((ex) => {
        logger.warn(`Failed to find User Friend ${friend.id} of ${user.id} due to ${ex.message}`);

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
        logger.info(`Created User Friend ${newUserFriend.friend.id} of ${newUserFriend.user.id}`);

        ResponseHelper.send(res, HttpStatusCode.CREATED);
      })
      .catch((ex) => {
        logger.warn(
          `Failed to create User Friend ${userFriend.friend.id} of ${userFriend.user.id} due to ${ex.message}`
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
        logger.info(`Updated User Friend ${upUserFriend.friend.id} of ${upUserFriend.user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(
          `Failed to update User Friend ${userFriend.friend.id} of ${userFriend.user.id} due to ${ex.message}`
        );

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else if (ex instanceof DuplicateEntityError)
          ResponseHelper.send(res, HttpStatusCode.CONFLICT, ex.errors);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }

  public static delete(req: Request, res: Response): void {
    const userFriend: UserFriend = getManager().create(UserFriend, {
      user: getManager().create(User, { id: req.user?.id ? req.user.id : '' }),
      friend: getManager().create(User, { id: req.params.id }),
    });

    getCustomRepository(UserFriendRepository)
      .deleteOrFail(userFriend)
      .then(() => {
        logger.info(`Deleted User Friend ${userFriend.friend.id} of ${userFriend.user.id}`);

        ResponseHelper.send(res, HttpStatusCode.OK);
      })
      .catch((ex) => {
        logger.warn(
          `Failed to delete User Friend ${userFriend.friend.id} of ${userFriend.user.id} due to ${ex.message}`
        );

        if (ex.name === 'EntityNotFound') ResponseHelper.send(res, HttpStatusCode.NOT_FOUND);
        else ResponseHelper.send(res, HttpStatusCode.INTERNAL_SERVER_ERROR);
      });
  }
}
