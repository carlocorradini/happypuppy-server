import { Router } from 'express';
import { ActorController } from '../../../controllers';
import { AuthMiddleware } from '../../../middleware';

const router = Router();

router.get('/:id([0-9]+)', ActorController.getOne);
router.get('', ActorController.getAll);
router.post('', [AuthMiddleware.JWT], ActorController.add);
router.delete('/:id([0-9]+)', [AuthMiddleware.JWT], ActorController.delete);
router.put('/:id([0-9]+)', [AuthMiddleware.JWT], ActorController.update);

export default router;
