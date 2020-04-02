import dotenv from 'dotenv';

export interface Config {
  NODE_ENV: string;
  PORT: number;
  DATABASE_TYPE: string;
  DATABASE_URL: string;
  DATABASE_SSL: boolean;
  DATABASE_SYNCHRONIZE: boolean;
  DATABASE_ENTITIES: string;
  DATABASE_MIGRATIONS: string;
  DATABASE_SUBSCRIBERS: string;
  SECURITY_JWT_KEY: string;
}
// Load .env file in the current working directory
dotenv.config();

// prettier-ignore
const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 80,
  DATABASE_TYPE: process.env.DATABASE_TYPE || 'postgres',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/happypuppy',
  DATABASE_SSL: process.env.DATABASE_SSL ? process.env.DATABASE_SSL === 'true' : true,
  DATABASE_SYNCHRONIZE: process.env.DATABASE_SYNCHRONIZE ? process.env.DATABASE_SYNCHRONIZE === 'true' : process.env.NODE_ENV === 'development',
  DATABASE_ENTITIES: `./db/entity/**/*.${process.env.NODE_ENV === 'production' ? 'js' : 'ts'}`,
  DATABASE_MIGRATIONS:`./db/migration/**/*.${process.env.NODE_ENV === 'production' ? 'js' : 'ts'}`,
  DATABASE_SUBSCRIBERS: `/./db/subscriber/**/*.${process.env.NODE_ENV === 'production' ? 'js' : 'ts'}`,
  SECURITY_JWT_KEY: process.env.SECURITY_JWT_KEY || `2:<W_+3TJ-6ahMtv7LfgXc"XKxW4"Q&`,
};

export default config;
