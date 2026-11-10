import { describe, expect, test } from "vitest";
import { ClienteCorreo } from "../src/Clases/ClienteCorreo";
import { Contacto } from "../src/Clases/Contacto";

describe("RQ-7", () => {
  test("Al iniciar la redacción de un correo, se podrá registrar un borrador.", () => {
    const cliente = new ClienteCorreo();

    const borrador = cliente.crearBorrador();

    expect(cliente.getBorradores().contiene(borrador)).toBe(true);
    expect(cliente.getBorradores().getCorreos()).toHaveLength(1);
    expect(cliente.getEnviados().contiene(borrador)).toBe(false);
  });

  test("Los cambios realizados durante la edición deberán conservarse en el borrador  mediante las operaciones del gestor.", () => {
    const cliente = new ClienteCorreo();
    const luis = new Contacto("Luis", "luis@gmail.com");
    const borrador = cliente.crearBorrador();

    cliente.editarBorrador(borrador.getId(), { asunto: "Reunión" });
    cliente.editarBorrador(borrador.getId(), {
      contenido: "Nos vemos mañana",
      destinatarios: [luis],
    });

    const guardado = cliente.obtenerBorrador(borrador.getId());
    expect(guardado.getAsunto()).toBe("Reunión");
    expect(guardado.getContenido()).toBe("Nos vemos mañana");
    expect(guardado.getDestinatarios()).toEqual([luis]);
  });

  test("Se podrán recuperar y editar borradores existentes.", () => {
    const cliente = new ClienteCorreo();
    const borrador = cliente.crearBorrador();
    cliente.editarBorrador(borrador.getId(), { asunto: "Primer asunto" });

    const recuperado = cliente.obtenerBorrador(borrador.getId());
    expect(recuperado).toBe(borrador);

    cliente.editarBorrador(recuperado.getId(), { asunto: "Asunto corregido" });

    expect(cliente.obtenerBorrador(borrador.getId()).getAsunto()).toBe(
      "Asunto corregido",
    );
    expect(cliente.getBorradores().getCorreos()).toHaveLength(1);
  });

  test("Los borradores no requerirán inicialmente todos los datos obligatorios para el envío.", () => {
    const cliente = new ClienteCorreo();

    const borrador = cliente.crearBorrador();

    expect(borrador.getAsunto()).toBe("");
    expect(borrador.getDestinatarios()).toEqual([]);
    expect(cliente.getBorradores().contiene(borrador)).toBe(true);
  });

  test("Al enviar un borrador válido, este deberá trasladarse a la Bandeja de Enviados.", () => {
    const cliente = new ClienteCorreo();
    const borrador = cliente.crearBorrador();
    cliente.editarBorrador(borrador.getId(), {
      asunto: "Reunión",
      contenido: "Nos vemos mañana",
      remitente: new Contacto("Ana", "ana@gmail.com"),
      destinatarios: [new Contacto("Luis", "luis@gmail.com")],
    });

    cliente.enviar(borrador);

    expect(cliente.getEnviados().contiene(borrador)).toBe(true);
    expect(cliente.getBorradores().contiene(borrador)).toBe(false);
  });

  test("Un borrador inválido no deberá poder enviarse.", () => {
    const cliente = new ClienteCorreo();
    const borrador = cliente.crearBorrador();
    cliente.editarBorrador(borrador.getId(), { asunto: "Sin destinatarios" });

    expect(() => cliente.enviar(borrador)).toThrow(
      expect.objectContaining({ name: "CAMPO_OBLIGATORIO" }),
    );
    expect(cliente.getEnviados().contiene(borrador)).toBe(false);
    expect(cliente.getBorradores().contiene(borrador)).toBe(true);
  });
});
