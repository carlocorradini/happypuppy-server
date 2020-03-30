// eslint-disable-next-line no-unused-vars
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import User from '../db/entity/User';
import { CryptUtil, JWTUtil, APIUtil } from '../utils';
import { StatusCode, generateResponse } from '../response';
import logger from '../logger';

export default class AuthController {
  public static async signIn(req: Request, res: Response) {
    let response: { statusCode: StatusCode; data: any } = {
      statusCode: StatusCode.INTERNAL_SERVER_ERROR,
      data: '',
    };

    try {
      const credentials = await APIUtil.credentials(req);
      const user: User = await getRepository(User).findOneOrFail(
        { username: credentials.username },
        { select: ['id', 'username', 'password'] }
      );
      if (!(await CryptUtil.compare(credentials.password, user.password))) throw new Error();

      response = {
        statusCode: StatusCode.OK,
        data: {
          token: await JWTUtil.generate({
            id: user.id,
            username: user.username,
          }),
        },
      };
    } catch (ex) {
      logger.warn(`Unauthorized Access from ${await APIUtil.ip(req)}`);
      response = { statusCode: StatusCode.UNAUTHORIZED, data: 'Invalid Credentials' };
    } finally {
      generateResponse(res, response.statusCode, response.data);
    }
  }
}
