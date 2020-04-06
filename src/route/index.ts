// eslint-disable-next-line no-unused-vars
import { Router } from 'express';
import api from './api';

const router = Router();

router.use('/api', api);

export default router;
