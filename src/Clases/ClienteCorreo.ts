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
}
