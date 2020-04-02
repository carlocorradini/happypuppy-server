// eslint-disable-next-line no-unused-vars
import HttpStatusCode from './httpStatusCode';

export enum STATUS {
  // eslint-disable-next-line no-unused-vars
  SUCCESS = 'success',
  // eslint-disable-next-line no-unused-vars
  FAIL = 'fail',
  // eslint-disable-next-line no-unused-vars
  ERROR = 'error',
}

export default class StatusCode {
  public readonly code: number;

  public readonly name: string;

  public readonly description: string;

  public readonly httpStatusCode: HttpStatusCode;

  private constructor(
    code: number,
    name: string,
    description: string,
    httpStatusCode: HttpStatusCode
  ) {
    this.code = code;
    this.name = name;
    this.description = description;
    this.httpStatusCode = httpStatusCode;
  }

  public isSuccess(): boolean {
    return StatusCode.isSuccess(this);
  }

  public static isSuccess(statusCode: StatusCode): boolean {
    return statusCode.httpStatusCode.isSuccess();
  }

  public status(): STATUS {
    return StatusCode.status(this);
  }

  public static status(statusCode: StatusCode): STATUS {
    let status = STATUS.ERROR;

    if (HttpStatusCode.SUCCESSFUL_RESPONSES.has(statusCode.httpStatusCode)) {
      status = STATUS.SUCCESS;
    } else if (HttpStatusCode.CLIENT_ERROR_RESPONSES.has(statusCode.httpStatusCode)) {
      status = STATUS.FAIL;
    }

    return status;
  }

  public toString(): string {
    return JSON.stringify(this);
  }

  // Status Codes
  public static readonly AUTHENTICATION_SUCCEEDED = new StatusCode(
    0,
    'Authentication Succeeded',
    'Credentials provided has been accepted',
    HttpStatusCode.ACCEPTED
  );

  public static readonly AUTHENTICATION_FAILED_CREDENTIALS = new StatusCode(
    1,
    'Authentication Failed Credentials',
    'Credentials provided has not been accepted',
    HttpStatusCode.UNAUTHORIZED
  );

  public static readonly AUTHENTICATION_FAILED_JWT = new StatusCode(
    2,
    'Authentication Failed JWT',
    'JWT provided has not been accepted',
    HttpStatusCode.UNAUTHORIZED
  );

  public static readonly NOT_FOUND = new StatusCode(
    404,
    'Not Found',
    'The server can not find requested resource',
    HttpStatusCode.NOT_FOUND
  );

  public static readonly INTERNAL_SERVER_ERROR = new StatusCode(
    500,
    'Internal Server Error',
    "The server has encountered a situation it doesn't know how to handle",
    HttpStatusCode.INTERNAL_SERVER_ERROR
  );
  // END Status Codes

  // Status Codes list
  public static readonly STATUS_CODES: Set<StatusCode> = new Set([
    StatusCode.AUTHENTICATION_SUCCEEDED,
    StatusCode.AUTHENTICATION_FAILED_CREDENTIALS,
    StatusCode.AUTHENTICATION_FAILED_JWT,
    StatusCode.NOT_FOUND,
    StatusCode.INTERNAL_SERVER_ERROR,
  ]);
  // END Status Codes list
}
