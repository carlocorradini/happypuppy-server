import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { ValidatorMiddleware } from '@app/middleware';
import { PuppyController } from '@app/controller';
import Puppy, { PuppyValidationGroup } from '@app/db/entity/Puppy';

const router = Router();

router.get(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isUUID: true,
        errorMessage: 'Invalid Puppy id',
      },
    })
  ),
  PuppyController.find
);

router.post(
  '',
  ValidatorMiddleware.validateClass(Puppy, PuppyValidationGroup.REGISTRATION),
  PuppyController.register
);

router.patch(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isUUID: true,
        errorMessage: 'Invalid Puppy id',
      },
    })
  ),
  ValidatorMiddleware.validateClass(Puppy, PuppyValidationGroup.UPDATE),
  PuppyController.update
);

router.delete(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isUUID: true,
        errorMessage: 'Invalid Puppy id',
      },
    })
  ),
  PuppyController.delete
);

export default router;
