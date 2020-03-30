// eslint-disable-next-line no-unused-vars
import { Response, NextFunction, Request } from 'express';
import { getRepository } from 'typeorm';
import User from '../db/entity/User';
import { JWTUtil } from '../utils';
import { generateResponse, StatusCode } from '../response';

export default class AuthMiddleware {
  public static async JWT(req: Request, res: Response, next: NextFunction) {
    try {
      const token = await JWTUtil.token(req);
      const payload = await JWTUtil.payload(token);
      const user: User = await getRepository(User).findOneOrFail({
        id: payload.id,
        username: payload.username,
      });
      res.locals.payload = user;
      next();
    } catch (ex) {
      generateResponse(res, StatusCode.UNAUTHORIZED, 'Invalid Authorization Token');
    }
  }
}
