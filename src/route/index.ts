// eslint-disable-next-line no-unused-vars
import { Router } from 'express';
import { NotFoundMiddleware, ErrorMiddleware } from '@app/middleware';
import api from './api';

const router = Router();

router.use('/api', api);

router.use(NotFoundMiddleware.handle);

router.use(ErrorMiddleware.handle);

export default router;
