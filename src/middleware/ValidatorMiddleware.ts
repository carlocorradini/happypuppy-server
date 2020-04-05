// eslint-disable-next-line no-unused-vars
import { Response, Request, NextFunction } from 'express';
// eslint-disable-next-line no-unused-vars
import { ObjectType, getRepository, DeepPartial } from 'typeorm';
// eslint-disable-next-line no-unused-vars
import { ValidationChain, validationResult } from 'express-validator';
import { validate as validateClass } from 'class-validator';
import User from '@app/db/entity/User';
import { ResponseHelper, HttpStatusCode } from '@app/helper';
import { UnknownEntityError } from './error';

export default class ValidatorMiddleware {
  public static validateChain(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      await Promise.all(validations.map((validation) => validation.run(req)));
      const errors = validationResult(req);

      if (errors.isEmpty()) next();
      else ResponseHelper.send(res, HttpStatusCode.UNPROCESSABLE_ENTITY, errors.array());
    };
  }

  public static validateEntity<Entity>(
    entityClass: ObjectType<Entity>,
    validationGroup?: string[]
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const entity = getRepository(entityClass).create(req.body);
      const errors = await validateClass(entity, {
        groups: validationGroup,
        forbidUnknownValues: true,
        validationError: {
          target: false,
          value: true,
        },
      });

      if (errors.length !== 0)
        ResponseHelper.send(res, HttpStatusCode.UNPROCESSABLE_ENTITY, errors);
      else if (!this.addEntityToLocals(req, entity))
        next(
          new UnknownEntityError(
            `Failed to validate entity that is unknown, ${entityClass.name} not found`
          )
        );
      else {
        next();
      }
    };
  }

  private static addEntityToLocals<Entity>(req: Request, entity: DeepPartial<Entity>): boolean {
    let added: boolean = true;

    if (entity instanceof User) {
      req.app.locals.user = entity;
    } else {
      added = false;
    }

    return added;
  }
}
