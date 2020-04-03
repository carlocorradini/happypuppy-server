// eslint-disable-next-line no-unused-vars
import { Response, Request, NextFunction } from 'express';
// eslint-disable-next-line no-unused-vars
import { ValidationChain, validationResult } from 'express-validator';
import { ResponseHelper, StatusCode } from '@app/helper';

export default class ValidatorMiddleware {
  public static validate(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      await Promise.all(validations.map((validation) => validation.run(req)));
      const errors = validationResult(req);

      if (errors.isEmpty()) next();
      else ResponseHelper.send(res, StatusCode.UNPROCESSABLE_ENTITY, errors);
    };
  }
}
