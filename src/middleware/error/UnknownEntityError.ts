export default class UnknownEntityError extends Error {
  constructor(m: string) {
    super(m);

    Object.setPrototypeOf(this, UnknownEntityError.prototype);
  }
}
