import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { ValidatorMiddleware } from '@app/middleware';
import { AnimalSpecieController } from '@app/controller';

const router = Router();

router.get('', AnimalSpecieController.all);

router.get(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isInt: true,
        errorMessage: 'Invalid Animal Specie id',
      },
    })
  ),
  AnimalSpecieController.find
);

export default router;
