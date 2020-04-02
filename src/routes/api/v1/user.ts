import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '@app/controller';
import { AuthMiddleware } from '@app/middleware';
import { ValidationHelper } from '@app/helper';

const router = Router();

router.get('/:id', UserController.getOne);
router.get('', UserController.getAll);
router.post('', ValidationHelper.validate([body('username').isString()]), UserController.add);
router.delete('/:id', [AuthMiddleware.JWT], UserController.delete);
router.put('/:id', [AuthMiddleware.JWT], UserController.update);

export default router;
