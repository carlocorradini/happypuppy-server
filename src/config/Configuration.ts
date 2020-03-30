export default interface Config {
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
