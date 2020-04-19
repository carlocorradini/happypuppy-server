import { Router } from 'express';
import { checkSchema } from 'express-validator';
import Puppy, { PuppyValidationGroup } from '@app/db/entity/Puppy';
import { PuppyController } from '@app/controller';
import { ValidatorMiddleware, FileMiddleware } from '@app/middleware';

const router = Router();

router.get(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isInt: true,
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
        isInt: true,
        errorMessage: 'Invalid Puppy id',
      },
    })
  ),
  ValidatorMiddleware.validateClass(Puppy, PuppyValidationGroup.UPDATE),
  PuppyController.update
);

router.patch(
  '/:id/avatar',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isInt: true,
        errorMessage: 'Invalid Puppy id',
      },
    })
  ),
  FileMiddleware.memoryLoader.single('image'),
  ValidatorMiddleware.validateFileSingle('image'),
  PuppyController.updateAvatar
);

router.delete(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isInt: true,
        errorMessage: 'Invalid Puppy id',
      },
    })
  ),
  PuppyController.delete
);

export default router;
