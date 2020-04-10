import jwt from 'jsonwebtoken';
// eslint-disable-next-line no-unused-vars
import config from '@app/config';
// eslint-disable-next-line no-unused-vars
import { types } from '@app/common';

export default class JWTHelper {
  public static sign(payload: types.JWT.Payload): Promise<string> {
    return Promise.resolve(
      jwt.sign(payload, config.SECURITY.JWT.SECRET, {
        expiresIn: config.SECURITY.JWT.EXPIRES_IN,
      })
    );
  }
}