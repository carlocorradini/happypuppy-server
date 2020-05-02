import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { ValidatorMiddleware } from '@app/middleware';
import { AnimalPersonalityController } from '@app/controller';

const router = Router();

router.get('', AnimalPersonalityController.find);

router.get(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isInt: true,
        errorMessage: 'Invalid Personality id',
      },
    })
  ),
  AnimalPersonalityController.findById
);

export default router;
