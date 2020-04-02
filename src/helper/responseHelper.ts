// eslint-disable-next-line no-unused-vars
import { Response as ExpressResponse } from 'express';
// eslint-disable-next-line no-unused-vars
import StatusCode from './statusCode';
import HttpStatusCode from './httpStatusCode';

export enum RESPONSE_STATUS {
  // eslint-disable-next-line no-unused-vars
  SUCCESS = 'success',
  // eslint-disable-next-line no-unused-vars
  FAIL = 'fail',
  // eslint-disable-next-line no-unused-vars
  ERROR = 'error',
}

export interface Response {
  status: RESPONSE_STATUS;
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
  public static send(res: ExpressResponse, statusCode: StatusCode, data?: any) {
    res.status(statusCode.httpStatusCode.code).json(<Response>{
      status: ResponseHelper.status(statusCode),
      is_success: statusCode.isSuccessStatusCode(),
      http_status_code: statusCode.httpStatusCode.code,
      http_status_code_name: statusCode.httpStatusCode.name,
      status_code: statusCode.code,
      status_code_name: statusCode.name,
      data,
    });
  }

  private static status(statusCode: StatusCode) {
    let status = RESPONSE_STATUS.ERROR;

    if (HttpStatusCode.SUCCESSFUL_RESPONSES.has(statusCode.httpStatusCode)) {
      status = RESPONSE_STATUS.SUCCESS;
    } else if (HttpStatusCode.CLIENT_ERROR_RESPONSES.has(statusCode.httpStatusCode)) {
      status = RESPONSE_STATUS.FAIL;
    }

    return status;
  }
}
