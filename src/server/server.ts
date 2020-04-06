import path from 'path';
// eslint-disable-next-line no-unused-vars
import { AddressInfo } from 'net';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'express-jwt';
import config from '@app/config';
import logger from '@app/logger';
import routes from '@app/route';
import { NotFoundMiddleware, ErrorMiddleware } from '@app/middleware';

export default class Server {
  public static readonly DEFAULT_PORT = 0;

  private static instance: Server;

  private readonly server: express.Application;

  private addressInfo!: AddressInfo;

  private constructor() {
    this.server = express();
    logger.debug('Server initialized');
    this.config();
    logger.debug('Server configured');
  }

  private config(): void {
    this.server
      .options('*', cors())
      .use(cors())
      .enable('trust proxy')
      .use(compression())
      .use(helmet())
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({ extended: true }))
      .use(favicon(path.join(__dirname, '../public', 'favicon.ico')))
      .use('/public', express.static(path.join(__dirname, '../public')))
      .use(
        '/private',
        jwt({
          secret: config.SECURITY.JWT.SECRET,
        }),
        express.static(path.join(__dirname, '../private'))
      )
      .use('/', routes)
      .use(NotFoundMiddleware.handle)
      .use(ErrorMiddleware.handle);
  }

  public static getInstance(): Server {
    if (!Server.instance) {
      Server.instance = new Server();
      logger.debug('Server instantiated');
    }
    return Server.instance;
  }

  public listen(port: number = Server.DEFAULT_PORT): Promise<AddressInfo> {
    return new Promise((resolve, reject) => {
      const serverListener = this.server
        .listen(port, () => {
          this.addressInfo = serverListener.address() as AddressInfo;
          resolve(this.addressInfo);
        })
        .on('error', (ex) => {
          reject(ex);
        });
    });
  }

  public getAddressInfo(): AddressInfo {
    return this.addressInfo;
  }
}
