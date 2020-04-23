import { Router } from 'express';
import { checkSchema } from 'express-validator';
import User, { UserValidationGroup } from '@app/db/entity/User';
import UserPasswordReset from '@app/db/entity/UserPasswordReset';
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
  ValidatorMiddleware.validateClass(User, UserValidationGroup.CREATION),
  UserController.create
);
router.post(
  '/sign_in',
  ValidatorMiddleware.validateClass(User, UserValidationGroup.SIGN_IN),
  UserController.signIn
);
router.post(
  '/password_reset/:email',
  ValidatorMiddleware.validateChain(
    checkSchema({
      email: {
        in: ['params'],
        isEmail: true,
        errorMessage: 'Invalid email',
      },
    })
  ),
  UserController.passwordResetRequest
);
router.post(
  '/password_reset',
  ValidatorMiddleware.validateClass(UserPasswordReset),
  UserController.passwordReset
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
