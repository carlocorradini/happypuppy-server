// eslint-disable-next-line no-unused-vars
import { jwt } from '@app/typings';

declare global {
  namespace Express {
    export interface Request {
      user?: jwt.Payload;
    }
  }
}
