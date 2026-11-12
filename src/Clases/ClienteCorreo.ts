import { ErrorCorreo } from "../Errores/ErrorCorreo";
import { VerificacionCampoObligatorio } from "../Verificaciones/VerificacionCampoObligatorio";
import { Bandeja } from "./Bandeja";
import { Contacto } from "./Contacto";
import { Correo } from "./Correo";
import { esFavorito, noLeido } from "./Filtros";

export interface CambiosBorrador {
  asunto?: string;
  contenido?: string;
  remitente?: Contacto;
  destinatarios?: Contacto[];
}

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

  /* Al iniciar la redacción, registra un borrador vacío en Borradores */
  public crearBorrador(): Correo {
    const borrador = new Correo();
    this._borradores.agregarCorreo(borrador);
    return borrador;
  }

  /* RF-07: Gestión de borradores */
  /* Guarda un correo en Borradores */
  public guardarBorrador(correo: Correo): void {
    this._borradores.agregarCorreo(correo);
  }

  public obtenerBorrador(id: string): Correo {
    const borrador = this._borradores
      .getCorreos()
      .find((correo) => correo.getId() === id);
    if (!borrador) {
      throw new ErrorCorreo({
        name: "CORREO_NO_ENCONTRADO",
        message: "El borrador no existe",
      });
    }
    return borrador;
  }

  public editarBorrador(id: string, cambios: CambiosBorrador): Correo {
    const borrador = this.obtenerBorrador(id);
    if (cambios.asunto !== undefined) {
      borrador.setAsunto(cambios.asunto);
    }
    if (cambios.contenido !== undefined) {
      borrador.setContenido(cambios.contenido);
    }
    if (cambios.remitente !== undefined) {
      borrador.setRemitente(cambios.remitente);
    }
    if (cambios.destinatarios !== undefined) {
      borrador.setDestinatarios(cambios.destinatarios);
    }
    return borrador;
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
      throw new ErrorCorreo({
        name: "CORREO_NO_ENCONTRADO",
        message: "El correo no está en la bandeja de origen",
      });
    }
    if (origen === destino) {
      throw new ErrorCorreo({
        name: "BANDEJA_DESTINO_INVALIDA",
        message: "La bandeja de origen y la de destino son la misma",
      });
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
      throw new ErrorCorreo({
        name: "CORREO_NO_ENCONTRADO",
        message: "El correo no está en esa bandeja",
      });
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
      throw new ErrorCorreo({
        name: "CORREO_NO_ENCONTRADO",
        message: "El correo no está en la papelera",
      });
    }
    this._papelera.quitarCorreo(correo);
    origen.agregarCorreo(correo);
    this._origenes.delete(correo);
  }
    /* RF-08: Marcar correos como leídos o no leídos */
  /* Busca un correo por su id en todas las bandejas */
  public obtenerCorreo(id: string): Correo {
    const correo = [
      ...this._enviados.getCorreos(),
      ...this._borradores.getCorreos(),
      ...this._papelera.getCorreos(),
    ].find((c) => c.getId() === id);
    if (!correo) {
      throw new ErrorCorreo({
        name: "CORREO_NO_ENCONTRADO",
        message: "El correo no existe",
      });
    }
    return correo;
  }

  public marcarComoLeido(id: string): void {
    this.obtenerCorreo(id).setLeido(true);
  }

  public marcarComoNoLeido(id: string): void {
    this.obtenerCorreo(id).setLeido(false);
  }

  /* Sin bandeja: consulta Enviados y Borradores (no la Papelera) */
  public obtenerNoLeidos(bandeja?: Bandeja): Correo[] {
    const correos = bandeja ? bandeja.getCorreos() : this.correosActivos();
    return correos.filter(noLeido);
  }

  private correosActivos(): Correo[] {
    return [...this._enviados.getCorreos(), ...this._borradores.getCorreos()];
  }
}
