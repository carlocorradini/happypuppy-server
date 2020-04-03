import { Router } from 'express';
import { AuthController } from '@app/controller';
import user from './user';

const router = Router();

router.use('/user', user);
router.post('/signin', AuthController.signIn);

export default router;
