export default class OwnerMismatchError extends Error {
  constructor(m: string) {
    super(m);

    Object.setPrototypeOf(this, OwnerMismatchError.prototype);
  }
}
