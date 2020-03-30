// eslint-disable-next-line no-unused-vars
import { Router, Request, Response } from 'express';
import config from '../config';
import { generateResponse, StatusCode } from '../response';
import api from './api';

const router = Router();

router.use('/api', api);

router.use((req: Request, res: Response) => {
  generateResponse(res, StatusCode.NOT_FOUND);
});

router.use((err: Error, req: Request, res: Response) => {
  generateResponse(
    res,
    StatusCode.INTERNAL_SERVER_ERROR,
    config.NODE_ENV !== 'production' ? err.stack : null
  );
});

export default router;
