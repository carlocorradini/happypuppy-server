// eslint-disable-next-line no-unused-vars
import { Response as ExpressResponse } from 'express';
// eslint-disable-next-line no-unused-vars
import StatusCode, { STATUS } from './statusCode';

export interface Response {
  status: STATUS;
  // eslint-disable-next-line camelcase
  is_success: boolean;
  // eslint-disable-next-line camelcase
  http_status_code: number;
  // eslint-disable-next-line camelcase
  http_status_code_name: string;
  // eslint-disable-next-line camelcase
  status_code: number;
  data: any;
}

export default class ResponseHelper {
  public static send(res: ExpressResponse, statusCode: StatusCode, data?: any): void {
    res.status(statusCode.httpStatusCode.code).json(<Response>{
      status: statusCode.status(),
      is_success: statusCode.isSuccess(),
      http_status_code: statusCode.httpStatusCode.code,
      http_status_code_name: statusCode.httpStatusCode.name,
      status_code: statusCode.code,
      status_code_name: statusCode.name,
      data,
    });
  }
}
