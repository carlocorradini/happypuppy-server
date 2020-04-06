import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { AuthController } from '@app/controller';
import { ValidatorMiddleware } from '@app/middleware';
import user from './user';

const router = Router();

router.use('/user', user);
router.post(
  '/verify/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isUUID: true,
        errorMessage: 'Invalid User id',
      },
    })
  ),
  AuthController.verify
);
router.post('/signin', AuthController.signIn);

export default router;
