import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { UserFriendController } from '@app/controller';
import { ValidatorMiddleware } from '@app/middleware';
import UserFriend, { UserFriendValidationGroup } from '@app/db/entity/UserFriend';

const router = Router();

router.get('', UserFriendController.all);

router.get(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isUUID: true,
        errorMessage: 'Invalid User Friend id',
      },
    })
  ),
  UserFriendController.find
);

router.post(
  '',
  ValidatorMiddleware.validateClass(UserFriend, UserFriendValidationGroup.CREATION),
  UserFriendController.create
);

router.patch(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isUUID: true,
        errorMessage: 'Invalid User Friend id',
      },
    })
  ),
  ValidatorMiddleware.validateClass(UserFriend, UserFriendValidationGroup.UPDATE),
  UserFriendController.update
);

router.delete(
  '/:id',
  ValidatorMiddleware.validateChain(
    checkSchema({
      id: {
        in: ['params'],
        isUUID: true,
        errorMessage: 'Invalid User Friend id',
      },
    })
  ),
  UserFriendController.delete
);

export default router;
