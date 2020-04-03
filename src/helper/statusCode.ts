// eslint-disable-next-line no-unused-vars
import { response } from '@app/typings';
import HttpStatusCode from './httpStatusCode';

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

  public status(): response.Status {
    return StatusCode.status(this);
  }

  public static status(statusCode: StatusCode): response.Status {
    let status = response.Status.ERROR;

    if (HttpStatusCode.SUCCESSFUL_RESPONSES.has(statusCode.httpStatusCode)) {
      status = response.Status.SUCCESS;
    } else if (HttpStatusCode.CLIENT_ERROR_RESPONSES.has(statusCode.httpStatusCode)) {
      status = response.Status.FAIL;
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
    HttpStatusCode.OK
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

  public static readonly FOUND = new StatusCode(
    10,
    'Found',
    'The requested resource has been found',
    HttpStatusCode.OK
  );

  public static readonly NOT_FOUND = new StatusCode(
    404,
    'Not Found',
    'The server can not find requested resource',
    HttpStatusCode.NOT_FOUND
  );

  public static readonly UNPROCESSABLE_ENTITY = new StatusCode(
    422,
    'Unprocessable Entity',
    'The request was well-formed but was unable to be followed due to semantic errors',
    HttpStatusCode.UNPROCESSABLE_ENTITY
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
    StatusCode.UNPROCESSABLE_ENTITY,
    StatusCode.INTERNAL_SERVER_ERROR,
  ]);
  // END Status Codes list
}
