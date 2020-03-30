export default class JWTInvalidPayloadError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, JWTInvalidPayloadError.prototype);
  }
}
