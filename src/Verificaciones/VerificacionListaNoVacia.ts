import { ErrorCorreo } from "../Errores/ErrorCorreo";
import { IVerificacion } from "./IVerificacion";

export class VerificacionListaNoVacia implements IVerificacion<unknown> {
  constructor(private readonly nombreCampo: string) {}

  verificar(valor: unknown): void {
    if (Array.isArray(valor) && valor.length === 0) {
      throw new ErrorCorreo({
        name: "CAMPO_OBLIGATORIO",
        message: `${this.nombreCampo} es obligatorio`,
      });
    }
  }
}
