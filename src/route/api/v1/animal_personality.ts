import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { ValidatorMiddleware } from '@app/middleware';
import { AnimalPersonalityController } from '@app/controller';

const router = Router();

router.get('', AnimalPersonalityController.all);

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
  AnimalPersonalityController.find
);

export default router;
