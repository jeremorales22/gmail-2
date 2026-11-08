import { IVerificacion } from "./IVerificacion";

export class VerificacionTextoNoVacio implements IVerificacion<unknown> {
  constructor(private readonly nombreCampo: string) {}

  verificar(valor: unknown): void {
    if (typeof valor === "string" && valor.trim() === "") {
      throw new Error(`${this.nombreCampo} es obligatorio`);
    }
  }
}
