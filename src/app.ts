import 'reflect-metadata';
import path from 'path';
// eslint-disable-next-line no-unused-vars
import { createConnection, ConnectionOptions } from 'typeorm';
import config from './config'; // ! Always first
import logger from './logger';
import { createServer } from './server';

createConnection(<ConnectionOptions>{
  type: config.DATABASE_TYPE,
  url: config.DATABASE_URL,
  extra: {
    ssl: config.DATABASE_SSL,
  },
  synchronize: config.DATABASE_SYNCHRONIZE,
  entities: [path.join(__dirname, config.DATABASE_ENTITIES)],
  migrations: [path.join(__dirname, config.DATABASE_MIGRATIONS)],
  subscribers: [path.join(__dirname, config.DATABASE_SUBSCRIBERS)],
})
  .then(() => {
    logger.info('Database connected');
    return createServer(config.PORT);
  })
  .then((port) => {
    logger.info(`Server running on port ${port}`);
  })
  .catch((ex) => {
    logger.error(ex.toString());
  });
