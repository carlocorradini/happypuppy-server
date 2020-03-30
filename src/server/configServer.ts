import path from 'path';
// eslint-disable-next-line no-unused-vars
import express, { Express } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from '../routes';

export default (app: Express): Promise<Express> => {
  app
    .options('*', cors())
    .use(cors())
    .enable('trust proxy')
    .use(compression())
    .use(helmet())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(favicon(path.join(__dirname, '../public', 'favicon.ico')))
    .use('/static', express.static(path.join(__dirname, '../public')))
    .use('/', routes);

  return new Promise((resolve) => {
    resolve(app);
  });
};
