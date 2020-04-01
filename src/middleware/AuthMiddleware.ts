// eslint-disable-next-line no-unused-vars
import { Response, NextFunction, Request } from 'express';
import { getRepository } from 'typeorm';
import { JWTUtil } from '@app/utils';
import logger from '@app/logger';
import User from '@app/db/entity/User';
import { generateResponse, StatusCode } from '../response';

export default class AuthMiddleware {
  public static async JWT(req: Request, res: Response, next: NextFunction) {
    JWTUtil.token(req)
      .then((token) => {
        return JWTUtil.payload(token);
      })
      .then((payload) => {
        return getRepository(User).findOneOrFail({
          id: payload.id,
          username: payload.username,
        });
      })
      .then((user) => {
        logger.info(`Authentication succeeded for user ${user.id}`);
        res.locals.payload = user;
        next();
      })
      .catch((ex) => {
        logger.warn(`Authentication failed due to ${ex}`);
        generateResponse(res, StatusCode.UNAUTHORIZED, 'Invalid Authorization Token');
      });
  }
}
