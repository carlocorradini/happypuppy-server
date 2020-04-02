// eslint-disable-next-line no-unused-vars
import { Response, Request, NextFunction } from 'express';
import logger from '@app/logger';
import { EnvUtil } from '@app/utils';
import { ResponseHelper, StatusCode } from '@app/helper';

export default class ErrorMiddleware {
  // eslint-disable-next-line no-unused-vars
  public static handle(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    if (err.name === 'UnauthorizedError') {
      logger.warn(`Authentication with JWT failed due to ${err.message}`);
      ResponseHelper.send(res, StatusCode.AUTHENTICATION_FAILED_JWT);
    } else {
      logger.error(`Internal Server error due to ${err.message}`);
      ResponseHelper.send(
        res,
        StatusCode.INTERNAL_SERVER_ERROR,
        EnvUtil.isProduction() ? err.stack : undefined
      );
    }
  }
}
