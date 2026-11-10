export class Contacto {
  private _email: string;
  private _nombre: string;

  constructor(nombre: string = "", email: string = "") {
    this._nombre = nombre;
    this._email = email;
  }

  getEmail(): string {
    return this._email;
  }

  setEmail(email: string): void {
    this._email = email;
  }

  getNombre(): string {
    return this._nombre;
  }

  setNombre(nombre: string): void {
    this._nombre = nombre;
  }
}
