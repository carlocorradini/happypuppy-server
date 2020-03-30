import path from 'path';
import dotenv from 'dotenv';
// eslint-disable-next-line no-unused-vars
import Configuration from './Configuration';

// Load .env file
dotenv.config({
  path: path.resolve(
    path.join(process.cwd(), process.env.NODE_ENV === 'production' ? './build' : ''),
    '.env'
  ),
});

// prettier-ignore
const config: Configuration = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 8080,
  DATABASE_TYPE: process.env.DATABASE_TYPE || 'postgres',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://username:password@localhost:5432/filmy',
  DATABASE_SSL: process.env.DATABASE_SSL ? process.env.DATABASE_SSL === 'true' : true,
  DATABASE_SYNCHRONIZE: process.env.DATABASE_SYNCHRONIZE ? process.env.DATABASE_SYNCHRONIZE === 'true' : true,
  DATABASE_ENTITIES: process.env.DATABASE_ENTITIES || `./db/entity/**/*.${process.env.NODE_ENV === 'production' ? 'js' : 'ts'}`,
  DATABASE_MIGRATIONS: process.env.DATABASE_MIGRATIONS || `./db/migration/**/*.${process.env.NODE_ENV === 'production' ? 'js' : 'ts'}`,
  DATABASE_SUBSCRIBERS: process.env.DATABASE_SUBSCRIBERS || `/./db/subscriber/**/*.${process.env.NODE_ENV === 'production' ? 'js' : 'ts'}`,
  SECURITY_JWT_KEY: process.env.SECURITY_JWT_KEY || '`2:<W_+3TJ-6ahMtv7LfgXc"XKxW4"Q&',
};

export default config;
