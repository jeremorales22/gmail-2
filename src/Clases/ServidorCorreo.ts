import { ErrorCorreo } from "../Errores/ErrorCorreo";
import { ClienteCorreo } from "./ClienteCorreo";
import { Contacto } from "./Contacto";
import { Correo } from "./Correo";

/* Simula el envío entre usuarios: cada contacto registrado tiene su propio
   ClienteCorreo, y al enviar cada destinatario recibe su copia */
export class ServidorCorreo {
  private _clientes: Map<string, ClienteCorreo> = new Map();

  public registrar(contacto: Contacto): ClienteCorreo {
    const clave = this.clave(contacto.getEmail());
    const existente = this._clientes.get(clave);
    if (existente) {
      return existente;
    }
    const cliente = new ClienteCorreo();
    this._clientes.set(clave, cliente);
    return cliente;
  }

  public obtenerCliente(email: string): ClienteCorreo {
    const cliente = this._clientes.get(this.clave(email));
    if (!cliente) {
      throw new ErrorCorreo({
        name: "CLIENTE_NO_REGISTRADO",
        message: `No hay un cliente registrado para ${email}`,
      });
    }
    return cliente;
  }

  public enviar(correo: Correo): void {
    const remitente = this.obtenerCliente(correo.getRemitente().getEmail());
    const destinos = correo
      .getDestinatarios()
      .map((destinatario) => this.obtenerCliente(destinatario.getEmail()));

    if (remitente.getEnviados().contiene(correo)) {
      return;
    }

    remitente.enviar(correo);
    destinos.forEach((cliente) => cliente.recibir(correo.copiar()));
  }

  private clave(email: string): string {
    return email.trim().toLowerCase();
  }
}
