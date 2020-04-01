import { Router } from 'express';
import { UserController } from '@app/controller';
import { AuthMiddleware } from '@app/middleware';

const router = Router();

router.get('/:id', UserController.getOne);
router.get('', UserController.getAll);
router.post('', UserController.add);
router.delete('/:id', [AuthMiddleware.JWT], UserController.delete);
router.put('/:id', [AuthMiddleware.JWT], UserController.update);

export default router;
