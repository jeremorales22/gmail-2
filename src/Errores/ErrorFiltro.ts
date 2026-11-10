// src/Errores/ErrorFiltro.ts
import { ErrorBase } from "./ErrorBase";

type NombreErrorFiltro =
  | "FILTRO_SIN_NOMBRE"
  | "LIMITE_FILTROS"
  | "FILTRO_DUPLICADO"
  | "FILTRO_INEXISTENTE";

export class ErrorFiltro extends ErrorBase<NombreErrorFiltro> {}
