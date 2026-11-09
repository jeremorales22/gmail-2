export class ErrorBase<T extends string> extends Error {
  name: T;

  constructor({ name, message }: { name: T; message: string }) {
    super(message);
    this.name = name;
  }
}
