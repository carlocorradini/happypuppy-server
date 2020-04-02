import envalid, { str, port, bool, num, url } from 'envalid';
import logger from '@app/logger';
// eslint-disable-next-line no-unused-vars
import { Configuration } from './interfaces';

const cleanConfig = envalid.cleanEnv(
  process.env,
  {
    NODE_ENV: str({ default: 'production', choices: ['production', 'development'] }),
    PORT: port({ devDefault: 8080 }),
    DATABASE_URL: url(),
    DATABASE_SSL: bool({ default: true, devDefault: false }),
    DATABASE_SYNCHRONIZE: bool({ default: false, devDefault: true }),
    SECURITY_BCRYPT_SALT_ROUNDS: num({
      default: 12,
      choices: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32],
    }),
    SECURITY_JWT_SECRET: str(),
    SECURITY_JWT_EXPIRES_IN: str({
      default: '32d',
      choices: ['1d', '2d', '4d', '8d', '16d', '32d'],
    }),
  },
  {
    strict: true,
  }
);

logger.info('Env loaded');

const config: Configuration = {
  NODE: {
    ENV: cleanConfig.NODE_ENV,
    PORT: cleanConfig.PORT,
  },
  DATABASE: {
    TYPE: 'postgres',
    URL: cleanConfig.DATABASE_URL,
    SSL: cleanConfig.DATABASE_SSL,
    SYNCHRONIZE: cleanConfig.DATABASE_SYNCHRONIZE,
    ENTITIES: `./db/entity/**/*.${cleanConfig.NODE_ENV === 'production' ? 'js' : 'ts'}`,
    MIGRATIONS: `./db/migration/**/*.${cleanConfig.NODE_ENV === 'production' ? 'js' : 'ts'}`,
    SUBSCRIBERS: `/./db/subscriber/**/*.${cleanConfig.NODE_ENV === 'production' ? 'js' : 'ts'}`,
  },
  SECURITY: {
    BCRYPT: {
      SALT_ROUNS: cleanConfig.SECURITY_BCRYPT_SALT_ROUNDS,
    },
    JWT: {
      SECRET: cleanConfig.SECURITY_JWT_SECRET,
      EXPIRES_IN: cleanConfig.SECURITY_JWT_EXPIRES_IN,
    },
  },
};

logger.debug('Configuration object constructed');

export default config;
