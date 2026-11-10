import { describe, expect, test } from "vitest";
import { Agenda } from "../src/Clases/Agenda";
import { Contacto } from "../src/Clases/Contacto";

function crearContacto(nombre: string, email: string): Contacto {
  const contacto = new Contacto();
  contacto.setNombre(nombre);
  contacto.setEmail(email);
  return contacto;
}

describe("RQ-3", () => {
  test("Se podrán dar de alta contactos en la agenda.", () => {
    const agenda = new Agenda();
    const ana = crearContacto("Ana", "ana@gmail.com");
    const luis = crearContacto("Luis", "luis@gmail.com");

    agenda.agregarContacto(ana);
    agenda.agregarContacto(luis);

    expect(agenda.getContactos()).toEqual([ana, luis]);
  });

  test("No se podrá dar de alta un contacto sin nombre o sin email.", () => {
    const agenda = new Agenda();

    expect(() => agenda.agregarContacto(new Contacto())).toThrow(
      expect.objectContaining({ name: "CONTACTO_INCOMPLETO" }),
    );
    expect(agenda.getContactos()).toEqual([]);
  });

  test("No se podrán registrar dos contactos con el mismo email.", () => {
    const agenda = new Agenda();
    agenda.agregarContacto(crearContacto("Ana", "ana@gmail.com"));

    expect(() =>
      agenda.agregarContacto(crearContacto("Otra Ana", "ANA@gmail.com")),
    ).toThrow(expect.objectContaining({ name: "CONTACTO_DUPLICADO" }));
    expect(agenda.getContactos()).toHaveLength(1);
  });

  test("Se podrá consultar un contacto por su email.", () => {
    const agenda = new Agenda();
    const ana = crearContacto("Ana", "ana@gmail.com");
    agenda.agregarContacto(ana);

    expect(agenda.buscarPorEmail("ana@gmail.com")).toBe(ana);
    expect(agenda.buscarPorEmail("nadie@gmail.com")).toBeNull();
  });

  test("Se podrán modificar los datos de un contacto.", () => {
    const agenda = new Agenda();
    agenda.agregarContacto(crearContacto("Ana", "ana@gmail.com"));

    agenda.modificarContacto(
      "ana@gmail.com",
      "Ana Paula",
      "anapaula@gmail.com",
    );

    const modificado = agenda.buscarPorEmail("anapaula@gmail.com");
    expect(modificado?.getNombre()).toBe("Ana Paula");
    expect(agenda.buscarPorEmail("ana@gmail.com")).toBeNull();
  });

  test("Se podrá modificar el nombre de un contacto conservando su email.", () => {
    const agenda = new Agenda();
    agenda.agregarContacto(crearContacto("Ana", "ana@gmail.com"));

    agenda.modificarContacto("ana@gmail.com", "Ana Paula", "ana@gmail.com");

    expect(agenda.buscarPorEmail("ana@gmail.com")?.getNombre()).toBe(
      "Ana Paula",
    );
  });

  test("Una modificación inválida no deberá alterar el contacto.", () => {
    const agenda = new Agenda();
    const ana = crearContacto("Ana", "ana@gmail.com");
    agenda.agregarContacto(ana);
    agenda.agregarContacto(crearContacto("Luis", "luis@gmail.com"));

    expect(() =>
      agenda.modificarContacto("nadie@gmail.com", "X", "x@gmail.com"),
    ).toThrow(expect.objectContaining({ name: "CONTACTO_INEXISTENTE" }));
    expect(() =>
      agenda.modificarContacto("ana@gmail.com", "", "ana@gmail.com"),
    ).toThrow(expect.objectContaining({ name: "CONTACTO_INCOMPLETO" }));
    expect(() =>
      agenda.modificarContacto("ana@gmail.com", "Ana", "luis@gmail.com"),
    ).toThrow(expect.objectContaining({ name: "CONTACTO_DUPLICADO" }));

    expect(ana.getNombre()).toBe("Ana");
    expect(ana.getEmail()).toBe("ana@gmail.com");
  });

  test("Se podrá dar de baja un contacto.", () => {
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

  test("La colección de contactos no deberá exponer modificaciones externas.", () => {
    const agenda = new Agenda();
    agenda.agregarContacto(crearContacto("Ana", "ana@gmail.com"));

    agenda.getContactos().push(crearContacto("Luis", "luis@gmail.com"));

    expect(agenda.getContactos()).toHaveLength(1);
  });
});
