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
  test("Cada filtro deberá identificar correctamente los correos que cumplen su condición.", () => {
    const filtro = new Filtro("De Ana", deRemitente("ana@gmail.com"));

    expect(filtro.aplicar(correos)).toEqual([parcial, reunion]);
    expect(filtro.cumple(parcial)).toBe(true);
    expect(filtro.cumple(sprints)).toBe(false);

    // Un filtro debe tener nombre
    expect(() => new Filtro("", noLeido)).toThrow(
      expect.objectContaining({ name: "FILTRO_SIN_NOMBRE" }),
    );
  });

  test("Los filtros compuestos deberán evaluar correctamente sus operadores lógicos.", () => {
    const conAnd = new Filtro("De Ana sin leer", and(deRemitente("ana@gmail.com"), noLeido));
    const conOr = new Filtro("Favoritos o de Luis", or(esFavorito, deRemitente("luis@gmail.com")));
    const conNot = new Filtro("Leídos", not(noLeido));

    expect(conAnd.aplicar(correos)).toEqual([parcial]);
    expect(conOr.aplicar(correos)).toEqual([parcial, sprints]);
    expect(conNot.aplicar(correos)).toEqual([reunion]);
  });

  test("Se deberán probar filtros simples y complejos.", () => {
    // Simples
    expect(new Filtro("No leídos", noLeido).aplicar(correos)).toEqual([parcial, sprints]);
    expect(new Filtro("Favoritos", esFavorito).aplicar(correos)).toEqual([parcial]);
    expect(new Filtro("Sprints", conTexto("sprints")).aplicar(correos)).toEqual([sprints]);

    // Complejo: combinaciones anidadas
    const complejo = new Filtro(
      "De Ana sin leer, o de Luis",
      or(and(deRemitente("ana@gmail.com"), noLeido), deRemitente("luis@gmail.com")),
    );
    expect(complejo.aplicar(correos)).toEqual([parcial, sprints]);
  });

  test("Se deberá impedir registrar más de cinco filtros.", () => {
    const registro = new RegistroFiltros();
    for (let i = 1; i <= 5; i++) {
      registro.agregarFiltro(new Filtro("Filtro " + i, noLeido));
    }

    expect(() => registro.agregarFiltro(new Filtro("Filtro 6", noLeido))).toThrow(
      expect.objectContaining({ name: "LIMITE_FILTROS" }),
    );
    expect(registro.getFiltros()).toHaveLength(5);

    // La colección no se puede modificar desde afuera
    registro.getFiltros().push(new Filtro("Intruso", noLeido));
    expect(registro.getFiltros()).toHaveLength(5);

    // Al eliminar uno se libera un lugar
    registro.eliminarFiltro("Filtro 1");
    registro.agregarFiltro(new Filtro("Nuevo", esFavorito));
    expect(registro.buscarFiltro("Filtro 1")).toBeNull();
    expect(registro.buscarFiltro("Nuevo")).not.toBeNull();
    expect(() => registro.eliminarFiltro("No existe")).toThrow(
      expect.objectContaining({ name: "FILTRO_INEXISTENTE" }),
    );

    // No se pueden repetir nombres
    registro.eliminarFiltro("Filtro 2");
    expect(() => registro.agregarFiltro(new Filtro("Nuevo", noLeido))).toThrow(
      expect.objectContaining({ name: "FILTRO_DUPLICADO" }),
    );
  });

  test("Los cambios en los correos deberán reflejarse en los resultados de los filtros sin necesidad de almacenar nuevamente los mensajes.", () => {
    const correo = crearCorreo("Aviso", ana, false, false);
    const lista = [correo];
    const filtro = new Filtro("No leídos", noLeido);
    expect(filtro.aplicar(lista)).toEqual([correo]);

    correo.setLeido(true);
    expect(filtro.aplicar(lista)).toEqual([]);

    correo.setLeido(false);
    expect(filtro.aplicar(lista)).toEqual([correo]);
  });

  test("Se deberá verificar que un filtro pueda reutilizarse en diferentes consultas.", () => {
    const filtro = new Filtro("De Ana", deRemitente("ana@gmail.com"));
    const otraLista = [
      crearCorreo("Uno", ana, true, false),
      crearCorreo("Dos", luis, true, false),
    ];

    expect(filtro.aplicar(correos)).toEqual([parcial, reunion]);
    expect(filtro.aplicar(otraLista)).toEqual([otraLista[0]]);
    expect(filtro.aplicar(correos)).toEqual([parcial, reunion]);

    // Aplicar no modifica la lista original
    expect(correos).toEqual([parcial, reunion, sprints]);

    // Registrado una vez, se aplica por nombre las veces que haga falta
    const registro = new RegistroFiltros();
    registro.agregarFiltro(filtro);
    expect(registro.aplicarFiltro("De Ana", correos)).toEqual([parcial, reunion]);
    expect(registro.aplicarFiltro("De Ana", otraLista)).toEqual([otraLista[0]]);
    expect(() => registro.aplicarFiltro("No existe", correos)).toThrow(
      expect.objectContaining({ name: "FILTRO_INEXISTENTE" }),
    );
  });
});