import { IVerificacion } from "./IVerificacion";

export class VerificacionPresente implements IVerificacion<unknown> {
  constructor(private readonly nombreCampo: string) {}

  verificar(valor: unknown): void {
    if (valor === null || valor === undefined) {
      throw new Error(`${this.nombreCampo} es obligatorio`);
    }
  }
}
