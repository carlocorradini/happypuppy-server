import { Router } from 'express';
import { checkSchema } from 'express-validator';
import User, { UserValidationGroup } from '@app/db/entity/User';
import { UserController } from '@app/controller';
import { ValidatorMiddleware } from '@app/middleware';

const router = Router();

router.get(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isUUID: true,
        errorMessage: 'Invalid User id',
      },
    })
  ),
  UserController.find
);

router.post(
  '',
  ValidatorMiddleware.validateEntity(User, [UserValidationGroup.REGISTRATION]),
  UserController.register
);

router.patch(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isUUID: true,
        errorMessage: 'Invalid User id',
      },
    })
  ),
  ValidatorMiddleware.validateEntity(User, [UserValidationGroup.UPDATE]),
  UserController.update
);

/* router.get('', UserController.getAll);
router.delete('/:id', UserController.delete); */

export default router;
