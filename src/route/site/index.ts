// eslint-disable-next-line no-unused-vars
import { Router, Request, Response } from 'express';
import { getManager } from 'typeorm';
import moment from 'moment';
import config from '@app/config';
import UserPasswordReset from '@app/db/entity/UserPasswordReset';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';

const router = Router();

router.get('', (_req: Request, res: Response) => {
  res.render('index');
});

router.get('/password_reset/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  let options: { user?: User; token?: string; consumed?: boolean } = {
    user: undefined,
    token: undefined,
    consumed: undefined,
  };

  const userPasswordReset = await getManager().findOne(UserPasswordReset, {
    where: { token },
    relations: ['user'],
  });

  if (
    userPasswordReset &&
    !userPasswordReset.consumed &&
    moment(new Date()).diff(userPasswordReset.updated_at, 'minutes') <=
      config.SECURITY.TOKEN.PASSWORD.EXPIRATION
  ) {
    options = {
      user: userPasswordReset.user,
      token: userPasswordReset.token,
      consumed: false,
    };
  } else if (userPasswordReset && userPasswordReset.consumed) {
    options = {
      user: userPasswordReset.user,
      consumed: true,
    };
  } else if (userPasswordReset) {
    options = {
      user: userPasswordReset.user,
    };
  }

  res.render('password_reset', { title: 'Password reset', ...options });
});

export default router;
