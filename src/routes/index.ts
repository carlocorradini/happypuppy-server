// eslint-disable-next-line no-unused-vars
import { Router, Request, Response } from 'express';
import config from '@app/config';
import api from './api';
import { generateResponse, StatusCode } from '../response';

const router = Router();

router.use('/api', api);

router.use((_req: Request, res: Response) => {
  generateResponse(res, StatusCode.NOT_FOUND);
});

router.use((err: Error, _req: Request, res: Response) => {
  generateResponse(
    res,
    StatusCode.INTERNAL_SERVER_ERROR,
    config.NODE_ENV !== 'production' ? err.stack : null
  );
});

export default router;
