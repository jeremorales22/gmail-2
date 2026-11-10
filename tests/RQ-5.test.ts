import { describe, expect, test } from "vitest";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";
import {
  and,
  conTexto,
  deRemitente,
  esFavorito,
  Filtro,
  noLeido,
  not,
  or,
} from "../src/Clases/Filtros";
import { RegistroFiltros } from "../src/Clases/RegistroFiltros";

function crearContacto(nombre: string, email: string): Contacto {
  return new Contacto(nombre, email);
}

const ana = crearContacto("Ana", "ana@gmail.com");
const luis = crearContacto("Luis", "luis@gmail.com");

function crearCorreo(
  asunto: string,
  remitente: Contacto,
  leido: boolean,
  favorito: boolean,
): Correo {
  const correo = new Correo();
  correo.setAsunto(asunto);
  correo.setContenido("Contenido de " + asunto);
  correo.setRemitente(remitente);
  correo.setDestinatarios([remitente === ana ? luis : ana]);
  correo.setLeido(leido);
  correo.setFavorito(favorito);
  return correo;
}

const parcial = crearCorreo("Parcial", ana, false, true);
const reunion = crearCorreo("Reunión", ana, true, false);
const sprints = crearCorreo("Sprints", luis, false, false);
const correos = [parcial, reunion, sprints];

describe("RQ-5", () => {
  test("Un filtro deberá devolver solo los correos que cumplen su condición.", () => {
    const filtro = new Filtro("De Ana", deRemitente("ana@gmail.com"));

    expect(filtro.aplicar(correos)).toEqual([parcial, reunion]);
    expect(filtro.cumple(sprints)).toBe(false);
  });

  test("Se deberán proveer filtros de ejemplo.", () => {
    expect(new Filtro("No leídos", noLeido).aplicar(correos)).toEqual([
      parcial,
      sprints,
    ]);
    expect(new Filtro("Favoritos", esFavorito).aplicar(correos)).toEqual([
      parcial,
    ]);
    expect(new Filtro("Sprints", conTexto("sprints")).aplicar(correos)).toEqual(
      [sprints],
    );
  });

  test("Los filtros se podrán combinar con and.", () => {
    const filtro = new Filtro(
      "De Ana sin leer",
      and(deRemitente("ana@gmail.com"), noLeido),
    );

    expect(filtro.aplicar(correos)).toEqual([parcial]);
  });

  test("Los filtros se podrán combinar con or.", () => {
    const filtro = new Filtro(
      "Favoritos o de Luis",
      or(esFavorito, deRemitente("luis@gmail.com")),
    );

    expect(filtro.aplicar(correos)).toEqual([parcial, sprints]);
  });

  test("Los filtros se podrán negar con not.", () => {
    const filtro = new Filtro("Leídos", not(noLeido));

    expect(filtro.aplicar(correos)).toEqual([reunion]);
  });

  test("Las combinaciones se podrán anidar.", () => {
    const filtro = new Filtro(
      "De Ana sin leer, o de Luis",
      or(
        and(deRemitente("ana@gmail.com"), noLeido),
        deRemitente("luis@gmail.com"),
      ),
    );

    expect(filtro.aplicar(correos)).toEqual([parcial, sprints]);
  });

  test("Un filtro deberá tener nombre.", () => {
    expect(() => new Filtro("", noLeido)).toThrow(
      expect.objectContaining({ name: "FILTRO_SIN_NOMBRE" }),
    );
  });

  test("Aplicar un filtro no deberá modificar la lista original.", () => {
    const lista = [parcial, reunion, sprints];

    new Filtro("No leídos", noLeido).aplicar(lista);

    expect(lista).toEqual([parcial, reunion, sprints]);
  });

  test("Se podrán registrar filtros y aplicarlos por su nombre.", () => {
    const registro = new RegistroFiltros();
    registro.agregarFiltro(new Filtro("Favoritos", esFavorito));

    expect(registro.getFiltros()).toHaveLength(1);
    expect(registro.aplicarFiltro("Favoritos", correos)).toEqual([parcial]);
  });

  test("El registro no deberá admitir más de 5 filtros.", () => {
    const registro = new RegistroFiltros();
    for (let i = 1; i <= 5; i++) {
      registro.agregarFiltro(new Filtro("Filtro " + i, noLeido));
    }

    expect(() =>
      registro.agregarFiltro(new Filtro("Filtro 6", noLeido)),
    ).toThrow(expect.objectContaining({ name: "LIMITE_FILTROS" }));
    expect(registro.getFiltros()).toHaveLength(5);
  });

  test("No se podrán registrar dos filtros con el mismo nombre.", () => {
    const registro = new RegistroFiltros();
    registro.agregarFiltro(new Filtro("Favoritos", esFavorito));

    expect(() =>
      registro.agregarFiltro(new Filtro("Favoritos", noLeido)),
    ).toThrow(expect.objectContaining({ name: "FILTRO_DUPLICADO" }));
  });

  test("Se podrá eliminar un filtro y liberar su lugar.", () => {
    const registro = new RegistroFiltros();
    for (let i = 1; i <= 5; i++) {
      registro.agregarFiltro(new Filtro("Filtro " + i, noLeido));
    }

    registro.eliminarFiltro("Filtro 1");
    registro.agregarFiltro(new Filtro("Nuevo", esFavorito));

    expect(registro.buscarFiltro("Filtro 1")).toBeNull();
    expect(registro.buscarFiltro("Nuevo")).not.toBeNull();
    expect(() => registro.eliminarFiltro("No existe")).toThrow(
      expect.objectContaining({ name: "FILTRO_INEXISTENTE" }),
    );
    expect(() => registro.aplicarFiltro("No existe", correos)).toThrow(
      expect.objectContaining({ name: "FILTRO_INEXISTENTE" }),
    );
  });

  test("La colección de filtros no deberá exponer modificaciones externas.", () => {
    const registro = new RegistroFiltros();
    registro.agregarFiltro(new Filtro("Favoritos", esFavorito));

    registro.getFiltros().push(new Filtro("Intruso", noLeido));

    expect(registro.getFiltros()).toHaveLength(1);
  });
});
