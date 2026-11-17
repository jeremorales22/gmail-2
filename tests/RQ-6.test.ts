import { describe, expect, test } from "vitest";
import { Bandeja } from "../src/Clases/Bandeja";
import { ClienteCorreo } from "../src/Clases/ClienteCorreo";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";

function crearContacto(nombre: string, email: string): Contacto {
  return new Contacto(nombre, email);
}

function crearCorreo(asunto: string): Correo {
  const correo = new Correo();
  correo.setAsunto(asunto);
  correo.setContenido("Contenido de " + asunto);
  correo.setRemitente(crearContacto("Ana", "ana@gmail.com"));
  correo.setDestinatarios([crearContacto("Luis", "luis@gmail.com")]);
  return correo;
}

describe("RQ-6", () => {
  test("Cada correo deberá pertenecer a una única bandeja física en un momento determinado.", () => {
    const cliente = new ClienteCorreo();
    const trabajo = new Bandeja();
    const correo = crearCorreo("Parcial");
    const bandejas = [
      cliente.getBorradores(),
      cliente.getEnviados(),
      cliente.getPapelera(),
      trabajo,
    ];
    const cantidad = () => bandejas.filter((b) => b.contiene(correo)).length;

    cliente.getBorradores().agregarCorreo(correo);
    expect(cantidad()).toBe(1);

    cliente.enviar(correo);
    expect(cantidad()).toBe(1);

    cliente.mover(correo, cliente.getEnviados(), trabajo);
    expect(cliente.getEnviados().contiene(correo)).toBe(false);
    expect(trabajo.contiene(correo)).toBe(true);
    expect(cantidad()).toBe(1);

    cliente.eliminar(correo, trabajo);
    expect(cantidad()).toBe(1);

    cliente.restaurar(correo);
    expect(cantidad()).toBe(1);
  });

  test("Se podrán consultar los correos contenidos en cada bandeja.", () => {
    const cliente = new ClienteCorreo();
    const enviado = crearCorreo("Enviado");
    const borrador = crearCorreo("Borrador");
    const eliminado = crearCorreo("Eliminado");
    cliente.enviar(enviado);
    cliente.enviar(eliminado);
    cliente.getBorradores().agregarCorreo(borrador);
    cliente.eliminar(eliminado, cliente.getEnviados());

    expect(cliente.getEnviados().getCorreos()).toEqual([enviado]);
    expect(cliente.getBorradores().getCorreos()).toEqual([borrador]);
    expect(cliente.getPapelera().getCorreos()).toEqual([eliminado]);
  });

  test("El sistema deberá permitir eliminar lógicamente un correo, trasladándolo a Eliminados.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    const otro = crearCorreo("Otro");
    cliente.enviar(correo);
    cliente.enviar(otro);

    // Eliminar lo traslada a la Papelera
    cliente.eliminar(correo, cliente.getEnviados());
    expect(cliente.getEnviados().contiene(correo)).toBe(false);
    expect(cliente.getPapelera().contiene(correo)).toBe(true);

    // Mover a la Papelera equivale a eliminar
    cliente.mover(otro, cliente.getEnviados(), cliente.getPapelera());
    expect(cliente.getPapelera().contiene(otro)).toBe(true);

    // No se puede eliminar un correo que no está en la bandeja indicada
    expect(() => cliente.eliminar(crearCorreo("Nuevo"), cliente.getEnviados())).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );

    // Eliminar desde la Papelera lo borra definitivamente
    cliente.eliminar(correo, cliente.getPapelera());
    expect(cliente.getPapelera().contiene(correo)).toBe(false);
    expect(cliente.getEnviados().contiene(correo)).toBe(false);
    expect(() => cliente.restaurar(correo)).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
  });

  test("Un correo eliminado podrá restaurarse a su bandeja de origen.", () => {
    const cliente = new ClienteCorreo();
    const enviado = crearCorreo("Enviado");
    const borrador = crearCorreo("Borrador");
    cliente.enviar(enviado);
    cliente.getBorradores().agregarCorreo(borrador);

    cliente.eliminar(enviado, cliente.getEnviados());
    cliente.eliminar(borrador, cliente.getBorradores());
    cliente.restaurar(enviado);
    cliente.restaurar(borrador);

    expect(cliente.getEnviados().contiene(enviado)).toBe(true);
    expect(cliente.getBorradores().contiene(borrador)).toBe(true);
    expect(cliente.getPapelera().getCorreos()).toEqual([]);

    // No se puede restaurar un correo que no está en la Papelera
    expect(() => cliente.restaurar(enviado)).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
  });

  test("No deberán generarse duplicados al mover correos.", () => {
    const cliente = new ClienteCorreo();
    const trabajo = new Bandeja();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.mover(correo, cliente.getEnviados(), trabajo);

    // Intentar moverlo otra vez desde donde ya no está
    expect(() => cliente.mover(correo, cliente.getEnviados(), trabajo)).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
    expect(trabajo.getCorreos()).toHaveLength(1);

    // Intentar moverlo a la misma bandeja
    expect(() => cliente.mover(correo, trabajo, trabajo)).toThrow(
      expect.objectContaining({ name: "BANDEJA_DESTINO_INVALIDA" }),
    );
    expect(trabajo.getCorreos()).toHaveLength(1);

    // Ida y vuelta: sigue habiendo una sola copia
    cliente.mover(correo, trabajo, cliente.getEnviados());
    cliente.mover(correo, cliente.getEnviados(), trabajo);
    expect(trabajo.getCorreos()).toHaveLength(1);
    expect(cliente.getEnviados().getCorreos()).toEqual([]);
  });
});