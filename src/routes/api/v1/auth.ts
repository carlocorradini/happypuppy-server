import { Router } from 'express';
import { AuthController } from '@app/controller';

const router = Router();

router.post('/', AuthController.auth);

export default router;
