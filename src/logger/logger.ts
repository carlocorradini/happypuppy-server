import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config';

const logger = createLogger({
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  exitOnError: false,
  format: format.combine(
    format.label({
      label: path.basename(process.mainModule !== undefined ? process.mainModule.filename : '?'),
    }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format((info) => {
          // eslint-disable-next-line no-param-reassign
          info.level = info.level.toUpperCase();
          return info;
        })(),
        format.colorize(),
        format.printf((info) => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`)
      ),
    }),
    new DailyRotateFile({
      dirname: './log',
      filename: '%DATE%',
      extension: '.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '1m',
      maxFiles: '14d',
      format: format.combine(
        format.printf(
          (info) => `${info.timestamp} ${info.level.toUpperCase()} [${info.label}]: ${info.message}`
        )
      ),
    }),
  ],
});

logger.debug('Logger created');

export default logger;
