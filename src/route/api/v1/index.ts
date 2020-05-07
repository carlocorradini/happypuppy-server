import { Router } from 'express';
import jwt from 'express-jwt';
import config from '@app/config';
// eslint-disable-next-line camelcase
import animal_personality from './animal_personality';
// eslint-disable-next-line camelcase
import animal_specie from './animal_specie';
// eslint-disable-next-line camelcase
import animal_breed from './animal_breed';
// eslint-disable-next-line camelcase
import animal_park from './animal_park';
// eslint-disable-next-line camelcase
import user_verification from './user_verification';
import auth from './auth';

const router = Router();

router.use('/user_verification', user_verification);

router.use('/animal_personality', animal_personality);

router.use('/animal_specie', animal_specie);

router.use('/animal_breed', animal_breed);

router.use('/animal_park', animal_park);

router.use(
  '/auth',
  jwt({
    secret: config.SECURITY.JWT.SECRET,
  }).unless({
    path: [
      { url: '/api/v1/auth/user', methods: ['POST'] },
      {
        url: '/api/v1/auth/user/sign_in',
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
