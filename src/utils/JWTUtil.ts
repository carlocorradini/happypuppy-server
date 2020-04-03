import jwt from 'jsonwebtoken';
// eslint-disable-next-line no-unused-vars
import config from '@app/config';
// eslint-disable-next-line no-unused-vars
import { jwtModel } from '@app/models';

export default class JWTUtil {
  public static sign(payload: jwtModel.Payload): Promise<string> {
    return Promise.resolve(
      jwt.sign(payload, config.SECURITY.JWT.SECRET, {
        expiresIn: config.SECURITY.JWT.EXPIRES_IN,
      })
    );
  }
}
