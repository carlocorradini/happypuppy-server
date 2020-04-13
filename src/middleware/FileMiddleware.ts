import path from 'path';
// eslint-disable-next-line no-unused-vars
import { Response, Request, NextFunction } from 'express';
import multer from 'multer';
import convert from 'convert-units';
import { EmptyFileError } from '@app/common/error';

export default class FileMiddleware {
  public static readonly memoryLoader = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: convert(16).from('Mb').to('b'),
    },
  });

  public static readonly diskLoader = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '../private/upload'));
      },
    }),
    limits: {
      fileSize: convert(64).from('Mb').to('b'),
    },
  });

  public static checkSingle(fieldName: string) {
    return (req: Request, _res: Response, next: NextFunction) => {
      if (req.file) next();
      else next(new EmptyFileError(`No file found in field named ${fieldName}`, fieldName));
    };
  }
}
