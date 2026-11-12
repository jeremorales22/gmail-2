import { describe, expect, test } from "vitest";
import { ClienteCorreo } from "../src/Clases/ClienteCorreo";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";

function crearCorreo(asunto: string): Correo {
  const correo = new Correo();
  correo.setAsunto(asunto);
  correo.setContenido("Contenido de " + asunto);
  correo.setRemitente(new Contacto("Ana", "ana@gmail.com"));
  correo.setDestinatarios([new Contacto("Luis", "luis@gmail.com")]);
  return correo;
}

describe("RQ-8", () => {
  test("Un correo nuevo deberá comenzar como no leído.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    expect(correo.getLeido()).toBe(false);
    expect(cliente.obtenerNoLeidos()).toEqual([correo]);
  });

  test("Se podrá marcar un correo como leído.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.marcarComoLeido(correo.getId());

    expect(correo.getLeido()).toBe(true);
    expect(cliente.obtenerNoLeidos()).toEqual([]);
  });

  test("Se podrá volver a marcar un correo como no leído.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);
    cliente.marcarComoLeido(correo.getId());

    cliente.marcarComoNoLeido(correo.getId());

    expect(correo.getLeido()).toBe(false);
    expect(cliente.obtenerNoLeidos()).toEqual([correo]);
  });

  test("Marcar dos veces el mismo estado no deberá generar cambios inesperados.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.marcarComoLeido(correo.getId());
    cliente.marcarComoLeido(correo.getId());

    expect(correo.getLeido()).toBe(true);
    expect(cliente.getEnviados().getCorreos()).toHaveLength(1);
  });

  test("Se podrán consultar los correos no leídos de todas las bandejas.", () => {
    const cliente = new ClienteCorreo();
    const enviado = crearCorreo("Enviado");
    const leido = crearCorreo("Leído");
    cliente.enviar(enviado);
    cliente.enviar(leido);
    const borrador = cliente.crearBorrador();
    cliente.marcarComoLeido(leido.getId());

    const noLeidos = cliente.obtenerNoLeidos();

    expect(noLeidos).toHaveLength(2);
    expect(noLeidos).toContain(enviado);
    expect(noLeidos).toContain(borrador);
  });

  test("Se podrán consultar los correos no leídos de una bandeja en particular.", () => {
    const cliente = new ClienteCorreo();
    const enviado = crearCorreo("Enviado");
    cliente.enviar(enviado);
    cliente.crearBorrador();

    expect(cliente.obtenerNoLeidos(cliente.getEnviados())).toEqual([enviado]);
  });

  test("Los correos de la Papelera no deberán contarse como no leídos.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.eliminar(correo, cliente.getEnviados());

    expect(cliente.obtenerNoLeidos()).toEqual([]);
    expect(cliente.obtenerNoLeidos(cliente.getPapelera())).toEqual([correo]);
  });

  test("Se podrá cambiar el estado de lectura de un correo en la Papelera.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);
    cliente.eliminar(correo, cliente.getEnviados());

    cliente.marcarComoLeido(correo.getId());

    expect(correo.getLeido()).toBe(true);
  });

  test("No se podrá marcar un correo que no existe.", () => {
    const cliente = new ClienteCorreo();

    expect(() => cliente.marcarComoLeido("id-inexistente")).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
    expect(() => cliente.marcarComoNoLeido("id-inexistente")).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
  });
});