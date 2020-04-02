import 'reflect-metadata';
import path from 'path';
// eslint-disable-next-line no-unused-vars
import { createConnection, ConnectionOptions } from 'typeorm';
import config from '@app/config'; // ! Always first
import Server from '@app/server';
import logger from '@app/logger';

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
    logger.info(`Database connected`);
    return Server.getInstance().listen(config.PORT);
  })
  .then((addressInfo) => {
    logger.info(`Server running at ${addressInfo.address} on port ${addressInfo.port}`);
  })
  .catch((ex) => {
    logger.error(ex.toString());
    process.exit(1);
  });
