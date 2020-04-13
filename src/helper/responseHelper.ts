// eslint-disable-next-line no-unused-vars
import { Response as ExpressResponse } from 'express';
// eslint-disable-next-line no-unused-vars
import HttpStatusCode, { Status } from './httpStatusCode';

export interface Response {
  status: Status;
  // eslint-disable-next-line camelcase
  is_success: boolean;
  // eslint-disable-next-line camelcase
  status_code: number;
  // eslint-disable-next-line camelcase
  status_code_name: string;
  data: object;
}

export default class ResponseHelper {
  public static send(
    res: ExpressResponse,
    httpStatusCode: HttpStatusCode,
    data: any = undefined
  ): void {
    res
      .status(httpStatusCode.code)
      .json(<Response>{
        status: httpStatusCode.status(),
        is_success: httpStatusCode.isSuccess(),
        status_code: httpStatusCode.code,
        status_code_name: httpStatusCode.name,
        data: this.data(httpStatusCode, data),
      })
      .end();
  }

  private static data(httpStatusCode: HttpStatusCode, data: any): object | undefined {
    if (data === undefined || httpStatusCode.isSuccess()) return data;

    return { errors: Array.isArray(data) ? data : [data] };
  }
}
