import { Correo } from "./Correo";
import { Filtro } from "./Filtros";

export class RegistroFiltros {
  public static readonly MAXIMO = 5;
  private _filtros: Filtro[] = [];

  public agregarFiltro(filtro: Filtro): void {
    if (this._filtros.length >= RegistroFiltros.MAXIMO) {
      throw new Error("No se pueden registrar más de 5 filtros");
    }
    if (this.buscarFiltro(filtro.getNombre())) {
      throw new Error("Ya existe un filtro con ese nombre");
    }
    this._filtros.push(filtro);
  }

  public getFiltros(): Filtro[] {
    return [...this._filtros];
  }

  public buscarFiltro(nombre: string): Filtro | null {
    const encontrado = this._filtros.find((f) => f.getNombre() === nombre);
    return encontrado ?? null;
  }

  public eliminarFiltro(nombre: string): void {
    const filtro = this.buscarFiltro(nombre);
    if (!filtro) {
      throw new Error("No existe un filtro con ese nombre");
    }
    this._filtros = this._filtros.filter((f) => f !== filtro);
  }

  public aplicarFiltro(nombre: string, correos: Correo[]): Correo[] {
    const filtro = this.buscarFiltro(nombre);
    if (!filtro) {
      throw new Error("No existe un filtro con ese nombre");
    }
    return filtro.aplicar(correos);
  }
}