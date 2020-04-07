// eslint-disable-next-line no-unused-vars
import { Response, Request, NextFunction } from 'express';
// eslint-disable-next-line no-unused-vars
import { ValidationChain, validationResult } from 'express-validator';
// eslint-disable-next-line no-unused-vars
import { transformAndValidate, ClassType } from 'class-transformer-validator';
import { ResponseHelper, HttpStatusCode } from '@app/helper';

export default class ValidatorMiddleware {
  public static validateChain(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      await Promise.all(validations.map((validation) => validation.run(req)));
      const errors = validationResult(req);

      if (errors.isEmpty()) next();
      else ResponseHelper.send(res, HttpStatusCode.UNPROCESSABLE_ENTITY, errors.array());
    };
  }

  public static validateClass<T extends object>(
    classType: ClassType<T>,
    validationGroup: string | string[] = []
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      transformAndValidate(classType, req.body, {
        validator: {
          groups: Array.isArray(validationGroup) ? validationGroup : [validationGroup],
          forbidUnknownValues: true,
          validationError: {
            target: false,
            value: true,
          },
        },
      })
        .then((_class) => {
          return this.addClassToLocals(req, _class);
        })
        .then(() => {
          next();
        })
        .catch((ex) => {
          ResponseHelper.send(res, HttpStatusCode.UNPROCESSABLE_ENTITY, ex);
        });
    };
  }

  private static addClassToLocals<T extends object>(req: Request, _class: T): Promise<void> {
    req.app.locals[_class.constructor.name] = _class;
    return Promise.resolve();
  }
}
