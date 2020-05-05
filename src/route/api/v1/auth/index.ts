import { Router } from 'express';
import user from './user';
// eslint-disable-next-line camelcase
import user_friend from './user_friend';
import puppy from './puppy';

const router = Router();

router.use('/user', user);
router.use('/user_friend', user_friend);
router.use('/puppy', puppy);

export default router;
