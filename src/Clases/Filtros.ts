import { Correo } from "./Correo";

// Un predicado recibe un correo y responde si cumple una condición
export type Predicado = (correo: Correo) => boolean;

// Combinadores: arman predicados nuevos a partir de otros
export function and(...predicados: Predicado[]): Predicado {
  return (correo) => predicados.every((p) => p(correo));
}

export function or(...predicados: Predicado[]): Predicado {
  return (correo) => predicados.some((p) => p(correo));
}

export function not(predicado: Predicado): Predicado {
  return (correo) => !predicado(correo);
}

// Predicados de ejemplo
export function deRemitente(email: string): Predicado {
  const buscado = email.toLowerCase();
  return (correo) => correo.getRemitente()?.getEmail().toLowerCase() === buscado;
}

export const noLeido: Predicado = (correo) => !correo.getLeido();

export const esFavorito: Predicado = (correo) => correo.getFavorito();

export function conTexto(texto: string): Predicado {
  return (correo) => correo.contieneTexto(texto);
}

export class Filtro {
  private _nombre: string;
  private _predicado: Predicado;

  constructor(nombre: string, predicado: Predicado) {
    if (!nombre || nombre.trim() === "") {
      throw new Error("El filtro debe tener un nombre");
    }
    this._nombre = nombre;
    this._predicado = predicado;
  }

  public getNombre(): string {
    return this._nombre;
  }

  public cumple(correo: Correo): boolean {
    return this._predicado(correo);
  }

  public aplicar(correos: Correo[]): Correo[] {
    return correos.filter((correo) => this.cumple(correo));
  }
}