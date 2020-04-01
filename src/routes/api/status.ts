// eslint-disable-next-line no-unused-vars
import { Router, Request, Response } from 'express';
import { StatusCode } from '@app/response';

const router = Router();

const status = (_req: Request, res: Response) => {
  res.status(StatusCode.OK).end();
};

router.get('/', status);
router.head('/', status);

export default router;
