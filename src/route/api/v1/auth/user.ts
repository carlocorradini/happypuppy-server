import { Router } from 'express';
import { checkSchema } from 'express-validator';
import User, { UserValidationGroup } from '@app/db/entity/User';
import UserVerification from '@app/db/entity/UserVerification';
import { UserController } from '@app/controller';
import { ValidatorMiddleware, FileMiddleware } from '@app/middleware';

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
  ValidatorMiddleware.validateClass(User, UserValidationGroup.REGISTRATION),
  UserController.register
);
router.post('/verify', ValidatorMiddleware.validateClass(UserVerification), UserController.verify);
router.post(
  '/signin',
  ValidatorMiddleware.validateClass(User, UserValidationGroup.SIGN_IN),
  UserController.signIn
);

router.patch(
  '',
  ValidatorMiddleware.validateClass(User, UserValidationGroup.UPDATE),
  UserController.update
);

router.patch(
  '/avatar',
  FileMiddleware.memoryLoader.single('image'),
  ValidatorMiddleware.validateFileSingle('image'),
  UserController.updateAvatar
);

router.delete('', UserController.delete);

export default router;
