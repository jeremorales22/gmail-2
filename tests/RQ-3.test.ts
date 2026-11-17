import { describe, expect, test } from "vitest";
import { Agenda } from "../src/Clases/Agenda";
import { ClienteCorreo } from "../src/Clases/ClienteCorreo";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";

function crearContacto(nombre: string, email: string): Contacto {
  return new Contacto(nombre, email);
}

describe("RQ-3", () => {
  test("Se podrán agregar nuevos contactos.", () => {
    const agenda = new Agenda();
    const ana = crearContacto("Ana", "ana@gmail.com");
    const luis = crearContacto("Luis", "luis@gmail.com");

    agenda.agregarContacto(ana);
    agenda.agregarContacto(luis);

    expect(agenda.getContactos()).toEqual([ana, luis]);

    // No se puede agregar un contacto sin nombre o sin email
    expect(() => agenda.agregarContacto(new Contacto())).toThrow(
      expect.objectContaining({ name: "CONTACTO_INCOMPLETO" }),
    );
    expect(agenda.getContactos()).toHaveLength(2);
  });

  test("Se podrán consultar y modificar contactos existentes.", () => {
    const agenda = new Agenda();
    const ana = crearContacto("Ana", "ana@gmail.com");
    agenda.agregarContacto(ana);
    agenda.agregarContacto(crearContacto("Luis", "luis@gmail.com"));

    // Consultar
    expect(agenda.buscarPorEmail("ana@gmail.com")).toBe(ana);
    expect(agenda.buscarPorEmail("nadie@gmail.com")).toBeNull();
    agenda.getContactos().push(crearContacto("Pedro", "pedro@gmail.com"));
    expect(agenda.getContactos()).toHaveLength(2);

    // Modificar solo el nombre, conservando el email
    agenda.modificarContacto("ana@gmail.com", "Ana Paula", "ana@gmail.com");
    expect(agenda.buscarPorEmail("ana@gmail.com")?.getNombre()).toBe("Ana Paula");

    // Modificar nombre y email
    agenda.modificarContacto("ana@gmail.com", "Ana", "anapaula@gmail.com");
    expect(agenda.buscarPorEmail("anapaula@gmail.com")?.getNombre()).toBe("Ana");
    expect(agenda.buscarPorEmail("ana@gmail.com")).toBeNull();

    // Una modificación inválida no altera el contacto
    expect(() =>
      agenda.modificarContacto("nadie@gmail.com", "X", "x@gmail.com"),
    ).toThrow(expect.objectContaining({ name: "CONTACTO_INEXISTENTE" }));
    expect(() =>
      agenda.modificarContacto("anapaula@gmail.com", "", "anapaula@gmail.com"),
    ).toThrow(expect.objectContaining({ name: "CONTACTO_INCOMPLETO" }));
    expect(ana.getNombre()).toBe("Ana");
    expect(ana.getEmail()).toBe("anapaula@gmail.com");
  });

  test("Se podrán eliminar contactos de la agenda.", () => {
    const agenda = new Agenda();
    const ana = crearContacto("Ana", "ana@gmail.com");
    const luis = crearContacto("Luis", "luis@gmail.com");
    agenda.agregarContacto(ana);
    agenda.agregarContacto(luis);

    agenda.eliminarContacto("ana@gmail.com");

    expect(agenda.getContactos()).toEqual([luis]);
    expect(() => agenda.eliminarContacto("ana@gmail.com")).toThrow(
      expect.objectContaining({ name: "CONTACTO_INEXISTENTE" }),
    );
  });

 test("Se deberá validar que una dirección de correo electrónico tenga un formato aceptable.", () => {
  const agenda = new Agenda();

  expect(() => agenda.agregarContacto(crearContacto("Ana", "ana"))).toThrow(
    expect.objectContaining({ name: "CONTACTO_INCOMPLETO" }),
  );
  expect(() => agenda.agregarContacto(crearContacto("Ana", "ana@"))).toThrow(
    expect.objectContaining({ name: "CONTACTO_INCOMPLETO" }),
  );
  expect(agenda.getContactos()).toEqual([]);

  agenda.agregarContacto(crearContacto("Ana", "ana@gmail.com"));
  expect(agenda.getContactos()).toHaveLength(1);
  });

  test("El sistema deberá definir un criterio para impedir contactos duplicados por dirección de correo electrónico.", () => {
    const agenda = new Agenda();
    const ana = crearContacto("Ana", "ana@gmail.com");
    agenda.agregarContacto(ana);
    agenda.agregarContacto(crearContacto("Luis", "luis@gmail.com"));

    // Al agregar, sin importar mayúsculas
    expect(() =>
      agenda.agregarContacto(crearContacto("Otra Ana", "ANA@gmail.com")),
    ).toThrow(expect.objectContaining({ name: "CONTACTO_DUPLICADO" }));
    expect(agenda.getContactos()).toHaveLength(2);

    // Al modificar, usando el email de otro contacto
    expect(() =>
      agenda.modificarContacto("ana@gmail.com", "Ana", "luis@gmail.com"),
    ).toThrow(expect.objectContaining({ name: "CONTACTO_DUPLICADO" }));
    expect(ana.getEmail()).toBe("ana@gmail.com");
  });

  test("La eliminación de un contacto de la agenda no deberá eliminar los correos históricos que lo referencien.", () => {
    const agenda = new Agenda();
    const cliente = new ClienteCorreo();
    const ana = crearContacto("Ana", "ana@gmail.com");
    const luis = crearContacto("Luis", "luis@gmail.com");
    agenda.agregarContacto(ana);

    const correo = new Correo();
    correo.setAsunto("Reunión");
    correo.setContenido("Nos vemos mañana");
    correo.setRemitente(ana);
    correo.setDestinatarios([luis]);
    cliente.enviar(correo);

    agenda.eliminarContacto("ana@gmail.com");

    expect(agenda.buscarPorEmail("ana@gmail.com")).toBeNull();
    expect(cliente.getEnviados().contiene(correo)).toBe(true);
    expect(correo.getRemitente().getEmail()).toBe("ana@gmail.com");
  });
});