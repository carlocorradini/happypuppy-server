export default class UserNotVerifiedError extends Error {
  constructor(m: string) {
    super(m);

    Object.setPrototypeOf(this, UserNotVerifiedError.prototype);
  }
}
