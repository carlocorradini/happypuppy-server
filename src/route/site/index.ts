// eslint-disable-next-line no-unused-vars
import { Router, Request, Response } from 'express';
import { getManager } from 'typeorm';
import moment from 'moment';
import config from '@app/config';
import UserPasswordReset from '@app/db/entity/UserPasswordReset';
// eslint-disable-next-line no-unused-vars
import User from '@app/db/entity/User';

const router = Router();

const animals = [
  '🙈',
  '🙉',
  '🙊',
  '🐵',
  '🐒',
  '🦍',
  '🦧',
  '🐶',
  '🐕',
  '🦮',
  '🐕‍🦺',
  '🐩',
  '🐺',
  '🦊',
  '🦝',
  '🐱',
  '🐈',
  '🦁',
  '🐯',
  '🐅',
  '🐆',
  '🐴',
  '🐎',
  '🦄',
  '🦓',
  '🦌',
  '🐮',
  '🐂',
  '🐂',
  '🐄',
  '🐷',
  '🐖',
  '🐗',
  '🐏',
  '🐑',
  '🐐',
  '🐪',
  '🐫',
  '🦙',
  '🦒',
  '🐘',
  '🦏',
  '🦛',
  '🐭',
  '🐁',
  '🐀',
  '🐹',
  '🐰',
  '🐇',
  '🐿',
  '🦔',
  '🦇',
  '🐻',
  '🐨',
  '🐼',
  '🦥',
  '🦦',
  '🦨',
  '🦘',
  '🦡',
  '🐾',
  '🦃',
  '🐔',
  '🐓',
  '🐣',
  '🐤',
  '🐥',
  '🐦',
  '🐧',
  '🕊',
  '🦅',
  '🦆',
  '🦢',
  '🦉',
  '🦩',
  '🦚',
  '🦜',
  '🐸',
  '🐊',
  '🐢',
  '🦎',
  '🐍',
  '🐉',
  '🦕',
  '🦖',
  '🐳',
  '🐋',
  '🐬',
  '🐟',
  '🐠',
  '🐡',
  '🦈',
  '🐙',
  '🐚',
  '🐌',
  '🦋',
  '🐛',
  '🐜',
  '🐝',
  '🐞',
  '🦗',
  '🕷',
  '🦂',
  '🦟',
  '🦠',
  '🦀',
  '🦞',
  '🦐',
  '🦑',
];

router.get('', (_req: Request, res: Response) => {
  res.render('index', {
    title: 'Home',
    animal: animals[Math.floor(Math.random() * animals.length)],
  });
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
    !userPasswordReset.used &&
    moment(new Date()).diff(userPasswordReset.updated_at, 'minutes') <=
      config.SECURITY.TOKEN.PASSWORD.EXPIRES_IN
  ) {
    options = {
      user: userPasswordReset.user,
      token: userPasswordReset.token,
      consumed: false,
    };
  } else if (userPasswordReset && userPasswordReset.used) {
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
