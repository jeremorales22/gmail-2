// src/Errores/ErrorContacto.ts
import { ErrorBase } from "./ErrorBase";

type NombreErrorContacto =
  | "CONTACTO_INCOMPLETO"
  | "CONTACTO_DUPLICADO"
  | "CONTACTO_INEXISTENTE";

export class ErrorContacto extends ErrorBase<NombreErrorContacto> {}
