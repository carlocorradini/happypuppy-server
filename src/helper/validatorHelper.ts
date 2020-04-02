// eslint-disable-next-line no-unused-vars
import { Request, Response, NextFunction } from 'express';
// eslint-disable-next-line no-unused-vars
import { validationResult, ValidationChain } from 'express-validator';

export default class ValidatorHelper {
  public static validate(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        next();
      }

      res.status(422).json({ errors: errors.array() });
    };
  }
}
