// eslint-disable-next-line no-unused-vars
import { Request } from 'express';
import { Validator } from 'class-validator';
import { InvalidParamError, InvalidCredentialsError } from './errors';

interface Credentials {
  username: string;
  password: string;
}

export default class APIUtil {
  private static readonly VALIDATOR = new Validator();

  private static isValidCredentials(credentials: Credentials): boolean {
    return (
      typeof credentials !== 'undefined' &&
      typeof credentials.username !== 'undefined' &&
      credentials.username !== '' &&
      typeof credentials.password !== 'undefined' &&
      credentials.password !== ''
    );
  }

  public static id(id: string, strict: boolean = false): Promise<number> {
    const idParsed: number = parseInt(id, 10);

    return new Promise((resolve, reject) => {
      if (
        (strict && id === undefined) ||
        (id !== undefined && Number.isNaN(idParsed)) ||
        (id !== undefined && idParsed <= 0)
      ) {
        reject(new InvalidParamError(`${id} is not a valid identifier`));
      }
      resolve(idParsed);
    });
  }

  public static uuid(uuid: string, strict: boolean = false): Promise<string> {
    return new Promise((resolve, reject) => {
      if ((strict && uuid === undefined) || (uuid !== undefined && !this.VALIDATOR.isUUID(uuid))) {
        reject(new InvalidParamError(`${uuid} is not a valid identifier`));
      }
      resolve(uuid);
    });
  }

  public static limit(limit: string, strict: boolean = false): Promise<number> {
    const limitParsed: number = parseInt(limit, 10);

    return new Promise((resolve, reject) => {
      if (
        (strict && limit === undefined) ||
        (limit !== undefined && Number.isNaN(limitParsed)) ||
        (limit !== undefined && limitParsed <= 0)
      ) {
        reject(new InvalidParamError(`${limit} is not a valid limit`));
      }
      resolve(limitParsed);
    });
  }

  public static offset(offset: string, strict: boolean = false): Promise<number> {
    const offsetParsed = parseInt(offset, 10);

    return new Promise((resolve, reject) => {
      if (
        (strict && offsetParsed === undefined) ||
        (offset !== undefined && Number.isNaN(offsetParsed)) ||
        (offset !== undefined && offsetParsed < 0)
      ) {
        reject(new InvalidParamError(`${offset} is not a valid offset`));
      }
      resolve(offsetParsed);
    });
  }

  public static ip(req: Request): Promise<string> {
    const ip: string | undefined = req.headers['x-forwarded-for']
      ? req.headers['x-forwarded-for'][0]
      : req.connection.remoteAddress;

    return new Promise((resolve, reject) => {
      if (!ip) {
        reject();
      }
      resolve(ip);
    });
  }

  public static credentials(req: Request): Promise<Credentials> {
    const credentials = <Credentials>req.body;

    return new Promise((resolve, reject) => {
      if (!APIUtil.isValidCredentials(credentials)) {
        reject(new InvalidCredentialsError('Invalid Credentials received from Request'));
      }
      resolve(credentials);
    });
  }
}
