import { ErrorContacto } from "../Errores/ErrorContacto";
import { IVerificacion } from "./IVerificacion";

export interface DatosContacto {
  nombre: string;
  email: string;
}

export class VerificacionContactoCompleto implements IVerificacion<DatosContacto> {
  verificar(datos: DatosContacto): void {
    if (!datos.nombre || !datos.email) {
      throw new ErrorContacto({
        name: "CONTACTO_INCOMPLETO",
        message: "El contacto debe tener nombre y email",
      });
    }
  }
}
