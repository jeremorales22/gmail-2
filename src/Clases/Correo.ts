import { VerificacionCampoObligatorio } from "../Verificaciones/VerificacionCampoObligatorio";
import { randomUUID } from "node:crypto";
import { Contacto } from "./Contacto";

export class Correo {
  private _id: string;
  private _asunto: string;
  private _contenido: string;
  private _remitente: Contacto;

  private _destinatarios: Contacto[];
  private _destinarariosCC: Contacto[];
  private _destinarariosCCO: Contacto[];

  private _leido: boolean;
  private _favorito: boolean;

  private _fechaEnvio: Date | null; /* Date */
  private _fechaCreacion: Date; /* Date */

  constructor() {
    this._id = randomUUID();
    this._fechaCreacion = new Date();

    // Obligatorios: directo, porque el set no acepta vacío
    this._asunto = "";
    this._contenido = "";
    this._remitente = new Contacto();
    this._destinatarios = [];

    // El resto puede seguir usando su set
    this.setDestinatariosCC([]);
    this.setDestinatariosCCO([]);
    this.setLeido(false);
    this.setFavorito(false);
    this.setFechaEnvio(null);
  }

  /* Get y Set */
  getId(): string {
    return this._id;
  }

  setId(id: string): void {
    this._id = id;
  }

  getAsunto(): string {
    return this._asunto;
  }

  setAsunto(asunto: string): void {
    this.validarCampoObligatorio(asunto, "El asunto");
    this._asunto = asunto;
  }

  getContenido(): string {
    return this._contenido;
  }

  setContenido(contenido: string): void {
    this.validarCampoObligatorio(contenido, "El contenido");
    this._contenido = contenido;
  }

  getRemitente(): Contacto {
    return this._remitente;
  }

  setRemitente(remitente: Contacto): void {
    this.validarCampoObligatorio(remitente, "El remitente");
    this._remitente = remitente;
  }

  getDestinatarios(): Contacto[] {
    return [...this._destinatarios];
  }

  setDestinatarios(destinatarios: Contacto[]): void {
    this.validarCampoObligatorio(destinatarios, "Los destinatarios");
    this._destinatarios = [...destinatarios];
  }

  getDestinatariosCC(): Contacto[] {
    return this._destinarariosCC;
  }

  setDestinatariosCC(destinatariosCC: Contacto[]): void {
    this._destinarariosCC = destinatariosCC;
  }

  getDestinatariosCCO(): Contacto[] {
    return this._destinarariosCCO;
  }

  setDestinatariosCCO(destinatariosCCO: Contacto[]): void {
    this._destinarariosCCO = destinatariosCCO;
  }

  getLeido(): boolean {
    return this._leido;
  }

  setLeido(leido: boolean): void {
    this._leido = leido;
  }

  getFavorito(): boolean {
    return this._favorito;
  }

  setFavorito(favorito: boolean): void {
    this._favorito = favorito;
  }

  getFechaEnvio(): Date | null {
    return this._fechaEnvio;
  }

  setFechaEnvio(fechaEnvio: Date | null): void {
    this._fechaEnvio = fechaEnvio;
  }

  getFechaCreacion(): Date {
    return this._fechaCreacion;
  }

  setFechaCreacion(fechaCreacion: Date): void {
    this._fechaCreacion = fechaCreacion;
  }

  private validarCampoObligatorio(valor: unknown, nombreCampo: string): void {
    new VerificacionCampoObligatorio(nombreCampo).verificar(valor);
  }

  public contieneTexto(texto: string): boolean {
    const buscado = texto.trim().toLowerCase();
    if (buscado === "") return false;

    const remitente = this.getRemitente();
    const campos = [
      this.getAsunto(),
      this.getContenido(),
      remitente?.getNombre() ?? "",
      remitente?.getEmail() ?? "",
    ];
    for (const destinatario of this.getDestinatarios()) {
      campos.push(destinatario.getNombre(), destinatario.getEmail());
    }

    return campos.some((campo) => campo.toLowerCase().includes(buscado));
  }
}
