export default class JWTNotFoundError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, JWTNotFoundError.prototype);
  }
}
