import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { ValidatorMiddleware } from '@app/middleware';
import { PersonalityController } from '@app/controller';

const router = Router();

router.get('', PersonalityController.all);

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
  PersonalityController.find
);

export default router;
