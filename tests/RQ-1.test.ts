import { describe, expect, test } from "vitest";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";

describe("RQ-1", () => {
  test("Se podrán crear múltiples correos con diferentes remitentes y destinatarios.", () => {
    const ana = new Contacto();
    ana.setNombre("Ana");
    ana.setEmail("ana@gmail.com");

    const luis = new Contacto();
    luis.setNombre("Luis");
    luis.setEmail("luis@gmail.com");

    const marta = new Contacto();
    marta.setNombre("Marta");
    marta.setEmail("marta@gmail.com");

    const correo1 = new Correo();
    correo1.setAsunto("Parcial");
    correo1.setContenido("Mañana hay parcial de programación");
    correo1.setRemitente(ana);
    correo1.setDestinatarios([luis]);

    const correo2 = new Correo();
    correo2.setAsunto("Sprints");
    correo2.setContenido("Adjunto los sprints del proyecto");
    correo2.setRemitente(luis);
    correo2.setDestinatarios([ana, marta]);

    expect(correo1.getRemitente()).toBe(ana);
    expect(correo1.getDestinatarios()).toEqual([luis]);

    expect(correo2.getRemitente()).toBe(luis);
    expect(correo2.getDestinatarios()).toEqual([ana, marta]);

    expect(correo1.getRemitente()).not.toBe(correo2.getRemitente());
    expect(correo1.getDestinatarios()).not.toEqual(correo2.getDestinatarios());
  });

  test("Cada correo tendrá una identidad que permita distinguirlo de los demás.", () => {
    const correo1 = new Correo();
    const correo2 = new Correo();

    expect(correo1.getId()).toBeTruthy();
    expect(correo2.getId()).toBeTruthy();
    expect(correo1.getId()).not.toBe(correo2.getId());

    // El id no cambia al modificar el correo
    const idOriginal = correo1.getId();
    correo1.setAsunto("Nuevo asunto");
    correo1.setLeido(true);
    expect(correo1.getId()).toBe(idOriginal);
  });

  test("Se deberán validar los datos obligatorios cuando corresponda.", () => {
    const correo = new Correo();

    expect(() => correo.setAsunto("")).toThrow(
      expect.objectContaining({ name: "CAMPO_OBLIGATORIO" }),
    );
    expect(() => correo.setContenido("")).toThrow(
      expect.objectContaining({ name: "CAMPO_OBLIGATORIO" }),
    );
    expect(() => correo.setRemitente(null as any)).toThrow(
      expect.objectContaining({ name: "CAMPO_OBLIGATORIO" }),
    );
    expect(() => correo.setDestinatarios([])).toThrow(
      expect.objectContaining({ name: "CAMPO_OBLIGATORIO" }),
    );
  });

  test("Se deberá demostrar que los objetos creados mantienen correctamente su información.", () => {
    const ana = new Contacto();
    ana.setNombre("Ana");
    ana.setEmail("ana@gmail.com");

    const luis = new Contacto();
    luis.setNombre("Luis");
    luis.setEmail("luis@gmail.com");

    const marta = new Contacto();
    marta.setNombre("Marta");
    marta.setEmail("marta@gmail.com");

    const fechaEnvio = new Date("2026-10-31T10:00:00Z");

    const correo = new Correo();
    correo.setAsunto("Reunión");
    correo.setContenido("Nos vemos mañana");
    correo.setRemitente(ana);
    correo.setDestinatarios([luis, marta]);
    correo.setDestinatariosCC([ana]);
    correo.setDestinatariosCCO([marta]);
    correo.setLeido(true);
    correo.setFavorito(true);
    correo.setFechaEnvio(fechaEnvio);

    // Contacto mantiene su información
    expect(ana.getNombre()).toBe("Ana");
    expect(ana.getEmail()).toBe("ana@gmail.com");

    // Correo mantiene su información
    expect(correo.getAsunto()).toBe("Reunión");
    expect(correo.getContenido()).toBe("Nos vemos mañana");
    expect(correo.getRemitente()).toBe(ana);
    expect(correo.getDestinatarios()).toEqual([luis, marta]);
    expect(correo.getDestinatariosCC()).toEqual([ana]);
    expect(correo.getDestinatariosCCO()).toEqual([marta]);
    expect(correo.getLeido()).toBe(true);
    expect(correo.getFavorito()).toBe(true);
    expect(correo.getFechaEnvio()).toEqual(fechaEnvio);
    expect(correo.getFechaCreacion()).toBeInstanceOf(Date);

    // Los valores se pueden leer varias veces y siguen iguales
    expect(correo.getAsunto()).toBe("Reunión");
    expect(correo.getDestinatarios()).toEqual([luis, marta]);

    // Un correo nuevo arranca con valores por defecto
    const vacio = new Correo();
    expect(vacio.getAsunto()).toBe("");
    expect(vacio.getContenido()).toBe("");
    expect(vacio.getDestinatarios()).toEqual([]);
    expect(vacio.getLeido()).toBe(false);
    expect(vacio.getFavorito()).toBe(false);
    expect(vacio.getFechaEnvio()).toBeNull();
  });

  test("Las colecciones de destinatarios no deberán exponer modificaciones que comprometan las reglas del dominio", () => {
    const ana = new Contacto();
    ana.setNombre("Ana");
    ana.setEmail("ana@gmail.com");

    const luis = new Contacto();
    luis.setNombre("Luis");
    luis.setEmail("luis@gmail.com");

    const marta = new Contacto();
    marta.setNombre("Marta");
    marta.setEmail("marta@gmail.com");

    const lista = [luis];
    const correo = new Correo();
    correo.setDestinatarios(lista);

    // Modifico el array que le pasé
    lista.push(marta);
    expect(correo.getDestinatarios()).toEqual([luis]);

    // Modifico el array que me devolvió
    correo.getDestinatarios().push(marta);
    expect(correo.getDestinatarios()).toEqual([luis]);
  });
});
