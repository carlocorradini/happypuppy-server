export default class UserAlreadyVerifiedError extends Error {
  constructor(m: string) {
    super(m);

    Object.setPrototypeOf(this, UserAlreadyVerifiedError.prototype);
  }
}
