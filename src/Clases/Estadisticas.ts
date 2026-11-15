/* RF-10: Procesamiento funcional y estadísticas */
import { Correo } from "./Correo";
import { esFavorito, noLeido, Predicado } from "./Filtros";
import { pipe } from "./Funcional";

/* Funciones básicas, preparadas para combinarse con pipe */

// filter: se queda con los correos que cumplen el predicado
export const filtrarPor =
  (predicado: Predicado) =>
  (correos: Correo[]): Correo[] =>
    correos.filter(predicado);

// map: transforma cada correo en otro valor
export const obtenerAsuntos = (correos: Correo[]): string[] =>
  correos.map((correo) => correo.getAsunto());

export const obtenerRemitentes = (correos: Correo[]): string[] =>
  correos.map((correo) => correo.getRemitente().getEmail());

export const contar = (correos: Correo[]): number => correos.length;

// reduce: junta todos los correos en un solo resultado
export const contarPorRemitente = (
  correos: Correo[],
): Record<string, number> =>
  correos.reduce(
    (conteo, correo) => {
      const email = correo.getRemitente().getEmail();
      conteo[email] = (conteo[email] ?? 0) + 1;
      return conteo;
    },
    {} as Record<string, number>,
  );

// map + reduce: suma los destinatarios de todos los correos
export const totalDestinatarios = (correos: Correo[]): number =>
  correos
    .map((correo) => correo.getDestinatarios().length)
    .reduce((total, cantidad) => total + cantidad, 0);

/* Estadísticas armadas componiendo funciones con pipe */
export const contarNoLeidos: (correos: Correo[]) => number = pipe(
  filtrarPor(noLeido),
  contar,
);

export const contarFavoritos: (correos: Correo[]) => number = pipe(
  filtrarPor(esFavorito),
  contar,
);

export const asuntosNoLeidos: (correos: Correo[]) => string[] = pipe(
  filtrarPor(noLeido),
  obtenerAsuntos,
);

export interface ResumenCorreos {
  total: number;
  leidos: number;
  noLeidos: number;
  favoritos: number;
  porRemitente: Record<string, number>;
}

export function resumen(correos: Correo[]): ResumenCorreos {
  const noLeidos = contarNoLeidos(correos);
  return {
    total: contar(correos),
    leidos: contar(correos) - noLeidos,
    noLeidos,
    favoritos: contarFavoritos(correos),
    porRemitente: contarPorRemitente(correos),
  };
}