// eslint-disable-next-line no-unused-vars
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { JWTNotFoundError, JWTInvalidPayloadError } from './errors';
import config from '../config';

interface Payload {
  id: string;
  username: string;
}

export default class JWTUtil {
  private static readonly EXPIRES_IN: string = '1h';

  private static isValidPayload(payload: Payload): boolean {
    return (
      typeof payload !== 'undefined' &&
      typeof payload.id !== 'undefined' &&
      payload.id !== '' &&
      typeof payload.username !== 'undefined' &&
      payload.username !== ''
    );
  }

  public static token(req: Request): Promise<string> {
    let token: string | undefined = req.headers['x-access-token']
      ? req.headers['x-access-token'][0]
      : req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    return new Promise((resolve, reject) => {
      if (!token) {
        reject(new JWTNotFoundError('JWT not found in headers'));
      }
      resolve(token);
    });
  }

  public static payload(token: string): Promise<Payload> {
    return new Promise((resolve, reject) => {
      try {
        const payload = <Payload>jwt.verify(token, config.SECURITY_JWT_KEY);
        if (!JWTUtil.isValidPayload(payload)) {
          reject(new JWTInvalidPayloadError('JWT has invalid payload from token'));
        }
        resolve(payload);
      } catch (ex) {
        reject(ex);
      }
    });
  }

  public static generate(payload: Payload): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!JWTUtil.isValidPayload(payload)) {
        reject(new JWTInvalidPayloadError('JWT has invalid Payload'));
      }
      resolve(
        jwt.sign(payload, config.SECURITY_JWT_KEY, {
          expiresIn: JWTUtil.EXPIRES_IN,
        })
      );
    });
  }
}
