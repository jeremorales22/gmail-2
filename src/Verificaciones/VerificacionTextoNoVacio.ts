import { ErrorCorreo } from "../Errores/ErrorCorreo";
import { IVerificacion } from "./IVerificacion";

export class VerificacionTextoNoVacio implements IVerificacion<unknown> {
  constructor(private readonly nombreCampo: string) {}

  verificar(valor: unknown): void {
    if (typeof valor === "string" && valor.trim() === "") {
      throw new ErrorCorreo({
        name: "CAMPO_OBLIGATORIO",
        message: `${this.nombreCampo} es obligatorio`,
      });
    }
  }
}
