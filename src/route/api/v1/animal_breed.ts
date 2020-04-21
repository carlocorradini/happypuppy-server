import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { ValidatorMiddleware } from '@app/middleware';
import { AnimalBreedController } from '@app/controller';

const router = Router();

router.get('', AnimalBreedController.all);

router.get(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isInt: true,
        errorMessage: 'Invalid Animal Breed id',
      },
    })
  ),
  AnimalBreedController.find
);

export default router;
