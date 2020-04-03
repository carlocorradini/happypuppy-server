import { Router } from 'express';
import jwt from 'express-jwt';
import config from '@app/config';
import auth from './auth';

const router = Router();

router.use(
  '/auth',
  jwt({
    secret: config.SECURITY.JWT.SECRET,
  }).unless({
    path: [
      {
        url: '/api/v1/auth/signin',
        method: 'POST',
      },
      { url: '/api/v1/auth/user', method: 'POST' },
    ],
  }),
  auth
);

export default router;
