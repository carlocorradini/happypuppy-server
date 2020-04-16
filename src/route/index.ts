// eslint-disable-next-line no-unused-vars
import { Router } from 'express';
import api from './api';
import site from './site';

const router = Router();

router.use('/api', api);
router.use('/site', site);

export default router;
