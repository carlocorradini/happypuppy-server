import { Router } from 'express';
import user from './user';
import puppy from './puppy';

const router = Router();

router.use('/user', user);
router.use('/puppy', puppy);

export default router;
