export default class DocsNotFoundError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, DocsNotFoundError.prototype);
  }
}
