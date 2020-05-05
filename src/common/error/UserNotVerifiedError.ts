export default class UserNotVerifiedError extends Error {
  public readonly id: string | undefined;

  constructor(m: string, id?: string) {
    super(m);
    this.id = id;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
