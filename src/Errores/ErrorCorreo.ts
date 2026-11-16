// src/Errores/ErrorCorreo.ts
import { ErrorBase } from "./ErrorBase";

type NombreErrorCorreo =
  | "CAMPO_OBLIGATORIO"
  | "CORREO_NO_ENCONTRADO"
  | "BANDEJA_DESTINO_INVALIDA"
  | "CLIENTE_NO_REGISTRADO";

export class ErrorCorreo extends ErrorBase<NombreErrorCorreo> {}
