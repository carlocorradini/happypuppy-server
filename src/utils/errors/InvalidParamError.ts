export default class InvalidParamError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InvalidParamError.prototype);
  }
}
