import { Router } from 'express';
import jwt from 'express-jwt';
import config from '@app/config';
import personality from './personality';
import auth from './auth';

const router = Router();

router.use('/personality', personality);

router.use(
  '/auth',
  jwt({
    secret: config.SECURITY.JWT.SECRET,
  }).unless({
    path: [
      { url: '/api/v1/auth/user', methods: ['POST'] },
      {
        url: /\/api\/v1\/auth\/user\/verify\/*/,
        methods: ['POST'],
      },
      {
        url: '/api/v1/auth/user/signin',
        methods: ['POST'],
      },
      {
        url: /\/api\/v1\/auth\/user\/password_reset\/*/,
        methods: ['POST'],
      },
    ],
  }),
  auth
);

export default router;
