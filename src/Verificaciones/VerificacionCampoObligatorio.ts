import { IVerificacion } from "./IVerificacion";
import { VerificacionPresente } from "./VerificacionPresente";
import { VerificacionTextoNoVacio } from "./VerificacionTextoNoVacio";
import { VerificacionListaNoVacia } from "./VerificacionListaNoVacia";

export class VerificacionCampoObligatorio implements IVerificacion<unknown> {
  private readonly verificaciones: IVerificacion<unknown>[];

  constructor(nombreCampo: string) {
    this.verificaciones = [
      new VerificacionPresente(nombreCampo),
      new VerificacionTextoNoVacio(nombreCampo),
      new VerificacionListaNoVacia(nombreCampo),
    ];
  }

  verificar(valor: unknown): void {
    this.verificaciones.forEach((verificacion) =>
      verificacion.verificar(valor),
    );
  }
}
