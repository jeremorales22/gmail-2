import { ErrorCorreo } from "../Errores/ErrorCorreo";
import { IVerificacion } from "./IVerificacion";

export class VerificacionPresente implements IVerificacion<unknown> {
  constructor(private readonly nombreCampo: string) {}

  verificar(valor: unknown): void {
    if (valor === null || valor === undefined) {
      throw new ErrorCorreo({
        name: "CAMPO_OBLIGATORIO",
        message: `${this.nombreCampo} es obligatorio`,
      });
    }
  }
}
