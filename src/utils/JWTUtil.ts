import jwt from 'jsonwebtoken';
// eslint-disable-next-line no-unused-vars
import { config, JWtPayload } from '@app/config';

export default class JWTUtil {
  public static sign(payload: JWtPayload): Promise<string> {
    return Promise.resolve(
      jwt.sign(payload, config.SECURITY.JWT.SECRET, {
        expiresIn: config.SECURITY.JWT.EXPIRES_IN,
      })
    );
  }
}
