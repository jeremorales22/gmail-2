import { VerificacionCampoObligatorio } from "../Verificaciones/VerificacionCampoObligatorio";
import { Bandeja } from "./Bandeja";
import { Correo } from "./Correo";

export class ClienteCorreo {
  private _borradores: Bandeja;
  private _enviados: Bandeja;

  constructor() {
    this._borradores = new Bandeja();
    this._borradores.setNombre("Borradores");

    this._enviados = new Bandeja();
    this._enviados.setNombre("Enviados");
  }

  getBorradores(): Bandeja {
    return this._borradores;
  }

  getEnviados(): Bandeja {
    return this._enviados;
  }

  /* Mueve el correo a la bandeja de Enviados */
  enviar(correo: Correo): void {
    this.validarCampoObligatorio(
      correo.getRemitente().getEmail(),
      "El remitente",
    );
    this.validarCampoObligatorio(correo.getAsunto(), "El asunto");
    this.validarCampoObligatorio(
      correo.getDestinatarios(),
      "Los destinatarios",
    );

    // Si ya fue enviado, no se vuelve a registrar
    if (this._enviados.contiene(correo)) {
      return;
    }

    correo.setFechaEnvio(new Date());
    this._borradores.quitarCorreo(correo);
    this._enviados.agregarCorreo(correo);
  }

  private validarCampoObligatorio(valor: unknown, nombreCampo: string): void {
    new VerificacionCampoObligatorio(nombreCampo).verificar(valor);
  }

  public buscar(texto: string): Correo[] {
    const correos = [
      ...this.getEnviados().getCorreos(),
      ...this.getBorradores().getCorreos(),
    ];
    return correos.filter((correo) => correo.contieneTexto(texto));
  }
    private _papelera: Bandeja = new Bandeja();
  private _origenes: Map<Correo, Bandeja> = new Map();

  public getPapelera(): Bandeja {
    return this._papelera;
  }

  public mover(correo: Correo, origen: Bandeja, destino: Bandeja): void {
    if (!origen.contiene(correo)) {
      throw new Error("El correo no está en la bandeja de origen");
    }
    if (origen === destino) {
      throw new Error("La bandeja de origen y la de destino son la misma");
    }
    if (destino === this._papelera) {
      this.eliminar(correo, origen);
      return;
    }
    origen.quitarCorreo(correo);
    destino.agregarCorreo(correo);
  }

  public eliminar(correo: Correo, origen: Bandeja): void {
    if (!origen.contiene(correo)) {
      throw new Error("El correo no está en esa bandeja");
    }
    origen.quitarCorreo(correo);
    if (origen === this._papelera) {
      this._origenes.delete(correo);
      return;
    }
    this._origenes.set(correo, origen);
    this._papelera.agregarCorreo(correo);
  }

  public restaurar(correo: Correo): void {
    const origen = this._origenes.get(correo);
    if (!this._papelera.contiene(correo) || !origen) {
      throw new Error("El correo no está en la papelera");
    }
    this._papelera.quitarCorreo(correo);
    origen.agregarCorreo(correo);
    this._origenes.delete(correo);
  }
}
