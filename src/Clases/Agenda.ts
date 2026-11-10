import { ErrorContacto } from "../Errores/ErrorContacto";
import { VerificacionContactoCompleto } from "../Verificaciones/VerificacionContactoCompleto";
import { Contacto } from "./Contacto";

export class Agenda {
  private _contactos: Contacto[] = [];
  private readonly _verificacionContacto = new VerificacionContactoCompleto();

  // Alta
  public agregarContacto(contacto: Contacto): void {
    this._verificacionContacto.verificar({
      nombre: contacto.getNombre(),
      email: contacto.getEmail(),
    });

    if (this.buscarPorEmail(contacto.getEmail())) {
      throw new ErrorContacto({
        name: "CONTACTO_DUPLICADO",
        message: "Ya existe un contacto con ese email",
      });
    }
    this._contactos.push(contacto);
  }

  // Consulta
  public getContactos(): Contacto[] {
    return [...this._contactos];
  }

  public buscarPorEmail(email: string): Contacto | null {
    const buscado = email.toLowerCase();
    const encontrado = this._contactos.find(
      (contacto) => contacto.getEmail().toLowerCase() === buscado,
    );
    return encontrado ?? null;
  }

  // Modificación
  public modificarContacto(
    email: string,
    nuevoNombre: string,
    nuevoEmail: string,
  ): void {
    const contacto = this.buscarPorEmail(email);
    if (!contacto) {
      throw new ErrorContacto({
        name: "CONTACTO_INEXISTENTE",
        message: "No existe un contacto con ese email",
      });
    }

    this._verificacionContacto.verificar({
      nombre: nuevoNombre,
      email: nuevoEmail,
    });

    const otro = this.buscarPorEmail(nuevoEmail);
    if (otro && otro !== contacto) {
      throw new ErrorContacto({
        name: "CONTACTO_DUPLICADO",
        message: "Ya existe un contacto con ese email",
      });
    }
    contacto.setNombre(nuevoNombre);
    contacto.setEmail(nuevoEmail);
  }

  // Baja
  public eliminarContacto(email: string): void {
    const contacto = this.buscarPorEmail(email);
    if (!contacto) {
      throw new ErrorContacto({
        name: "CONTACTO_INEXISTENTE",
        message: "No existe un contacto con ese email",
      });
    }
    this._contactos = this._contactos.filter((c) => c !== contacto);
  }
}
