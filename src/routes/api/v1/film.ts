import { Router } from 'express';
import { FilmController } from '../../../controllers';
import { AuthMiddleware } from '../../../middleware';

const router = Router();

router.get('/:id([0-9]+)', FilmController.getOne);
router.get('', FilmController.getAll);
router.post('', [AuthMiddleware.JWT], FilmController.add);
router.delete('/:id([0-9]+)', [AuthMiddleware.JWT], FilmController.delete);
router.put('/:id([0-9]+)', [AuthMiddleware.JWT], FilmController.update);

export default router;
