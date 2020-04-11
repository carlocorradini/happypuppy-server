import { Router } from 'express';
import { AuthController } from '@app/controller';
import { ValidatorMiddleware } from '@app/middleware';
import User, { UserValidationGroup } from '@app/db/entity/User';
import UserVerification from '@app/db/entity/UserVerification';
import user from './user';
import puppy from './puppy';

const router = Router();

router.use('/user', user);
router.use('/puppy', puppy);
router.post('/verify', ValidatorMiddleware.validateClass(UserVerification), AuthController.verify);
router.post(
  '/signin',
  ValidatorMiddleware.validateClass(User, UserValidationGroup.SIGN_IN),
  AuthController.signIn
);

export default router;
