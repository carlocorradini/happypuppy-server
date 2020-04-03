import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { UserController } from '@app/controller';
import { ValidatorMiddleware } from '@app/middleware';

const router = Router();

router.get(
  '/:id',
  ValidatorMiddleware.validate(
    checkSchema({
      id: {
        in: ['params'],
        isUUID: true,
        errorMessage: 'Invalid User id',
      },
    })
  ),
  UserController.findById
);

router.post('', UserController.create);

/* router.get('', UserController.getAll);
router.post('', ValidatorMiddleware.validate([body('username').isString()]), UserController.add);
router.delete('/:id', UserController.delete);
router.put('/:id', UserController.update); */

export default router;
