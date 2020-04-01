import path from 'path';
// eslint-disable-next-line no-unused-vars
import { AddressInfo } from 'net';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from '@app/logger';
import routes from '@app/routes';

class Server {
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
      .use('/static', express.static(path.join(__dirname, '../public')))
      .use('/', routes);
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
          logger.debug(
            `Server listening at ${this.addressInfo.address} on port ${this.addressInfo.port}`
          );
          resolve(this.addressInfo);
        })
        .on('error', (ex) => {
          logger.error(`Server listening error due to ${ex.message}`);
          reject(ex);
        });
    });
  }

  public getAddressInfo(): AddressInfo {
    return this.addressInfo;
  }
}

export default Server;
