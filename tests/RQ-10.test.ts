import { describe, expect, test } from "vitest";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";
import {
  asuntosNoLeidos,
  contar,
  contarFavoritos,
  contarNoLeidos,
  contarPorRemitente,
  filtrarPor,
  obtenerAsuntos,
  obtenerRemitentes,
  resumen,
  totalDestinatarios,
} from "../src/Clases/Estadisticas";
import { deRemitente, esFavorito } from "../src/Clases/Filtros";
import { pipe } from "../src/Clases/Funcional";

const ana = new Contacto("Ana", "ana@gmail.com");
const luis = new Contacto("Luis", "luis@gmail.com");
const marta = new Contacto("Marta", "marta@gmail.com");

function crearCorreo(
  asunto: string,
  remitente: Contacto,
  destinatarios: Contacto[],
  leido: boolean,
  favorito: boolean,
): Correo {
  const correo = new Correo();
  correo.setAsunto(asunto);
  correo.setContenido("Contenido de " + asunto);
  correo.setRemitente(remitente);
  correo.setDestinatarios(destinatarios);
  correo.setLeido(leido);
  correo.setFavorito(favorito);
  return correo;
}

const parcial = crearCorreo("Parcial", ana, [luis], false, true);
const reunion = crearCorreo("Reunión", ana, [luis, marta], true, false);
const sprints = crearCorreo("Sprints", luis, [ana], false, false);
const correos = [parcial, reunion, sprints];

describe("RQ-10", () => {
  test("Se podrá transformar una colección de correos con map.", () => {
    expect(obtenerAsuntos(correos)).toEqual(["Parcial", "Reunión", "Sprints"]);
    expect(obtenerRemitentes(correos)).toEqual([
      "ana@gmail.com",
      "ana@gmail.com",
      "luis@gmail.com",
    ]);
  });

  test("Se podrá seleccionar una parte de los correos con filter.", () => {
    expect(filtrarPor(esFavorito)(correos)).toEqual([parcial]);
    expect(filtrarPor(deRemitente("ana@gmail.com"))(correos)).toEqual([
      parcial,
      reunion,
    ]);
  });

  test("Se podrán acumular resultados con reduce.", () => {
    expect(contarPorRemitente(correos)).toEqual({
      "ana@gmail.com": 2,
      "luis@gmail.com": 1,
    });
    expect(totalDestinatarios(correos)).toBe(4);
  });

  test("pipe deberá aplicar las funciones en orden.", () => {
    const sumarUno = (n: number) => n + 1;
    const duplicar = (n: number) => n * 2;

    expect(pipe(sumarUno, duplicar)(3)).toBe(8);
    expect(pipe(duplicar, sumarUno)(3)).toBe(7);
  });

  test("pipe sin funciones deberá devolver el mismo valor.", () => {
    expect(pipe()(5)).toBe(5);
  });

  test("Las estadísticas se podrán obtener componiendo funciones con pipe.", () => {
    expect(contarNoLeidos(correos)).toBe(2);
    expect(contarFavoritos(correos)).toBe(1);
    expect(asuntosNoLeidos(correos)).toEqual(["Parcial", "Sprints"]);

    const cantidadDeAna = pipe(filtrarPor(deRemitente("ana@gmail.com")), contar);
    expect(cantidadDeAna(correos)).toBe(2);
  });

  test("Se deberá poder generar un resumen de estadísticas.", () => {
    expect(resumen(correos)).toEqual({
      total: 3,
      leidos: 1,
      noLeidos: 2,
      favoritos: 1,
      porRemitente: { "ana@gmail.com": 2, "luis@gmail.com": 1 },
    });
  });

  test("Las estadísticas de una colección vacía deberán ser cero.", () => {
    expect(resumen([])).toEqual({
      total: 0,
      leidos: 0,
      noLeidos: 0,
      favoritos: 0,
      porRemitente: {},
    });
    expect(totalDestinatarios([])).toBe(0);
  });

  test("El procesamiento no deberá modificar la colección original.", () => {
    const lista = [parcial, reunion, sprints];

    resumen(lista);
    asuntosNoLeidos(lista);

    expect(lista).toEqual([parcial, reunion, sprints]);
    expect(parcial.getLeido()).toBe(false);
  });
});