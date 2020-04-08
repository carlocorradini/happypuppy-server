// eslint-disable-next-line no-unused-vars
import { Response, Request, NextFunction } from 'express';
import { UnauthorizedError } from 'express-jwt';
import logger from '@app/logger';
import { EnvUtil } from '@app/util';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class ErrorMiddleware {
  // eslint-disable-next-line no-unused-vars
  public static handle(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof UnauthorizedError) {
      logger.warn(`Authentication failed due to ${err.message}`);
      ResponseHelper.send(res, HttpStatusCode.UNAUTHORIZED);
    } else if (err instanceof SyntaxError) {
      logger.warn(`Malformed JSON due to ${err.message}`);
      ResponseHelper.send(res, HttpStatusCode.BAD_REQUEST, [err.message]);
    } else {
      logger.error(`Internal Server error due to ${err.message}`);
      ResponseHelper.send(
        res,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        EnvUtil.isDevelopment() ? err.stack : undefined
      );
    }
  }
}
