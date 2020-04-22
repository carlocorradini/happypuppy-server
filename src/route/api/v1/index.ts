import { Router } from 'express';
import jwt from 'express-jwt';
import config from '@app/config';
// eslint-disable-next-line camelcase
import animal_personality from './animal_personality';
// eslint-disable-next-line camelcase
import animal_specie from './animal_specie';
// eslint-disable-next-line camelcase
import animal_breed from './animal_breed';
import auth from './auth';

const router = Router();

router.use('/animal_personality', animal_personality);

router.use('/animal_specie', animal_specie);

router.use('/animal_breed', animal_breed);

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
