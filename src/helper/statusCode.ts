// eslint-disable-next-line no-unused-vars
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

  public isSuccessStatusCode(): boolean {
    return StatusCode.isSuccessStatusCode(this);
  }

  public static isSuccessStatusCode(statusCode: StatusCode): boolean {
    return statusCode.httpStatusCode.isSuccessStatusCode();
  }

  public toString(): string {
    return JSON.stringify(this);
  }
}
