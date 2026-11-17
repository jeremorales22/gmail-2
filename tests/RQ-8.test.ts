import { describe, expect, test } from "vitest";
import { ClienteCorreo } from "../src/Clases/ClienteCorreo";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";
import { Filtro, noLeido } from "../src/Clases/Filtros";

function crearCorreo(asunto: string): Correo {
  const correo = new Correo();
  correo.setAsunto(asunto);
  correo.setContenido("Contenido de " + asunto);
  correo.setRemitente(new Contacto("Ana", "ana@gmail.com"));
  correo.setDestinatarios([new Contacto("Luis", "luis@gmail.com")]);
  return correo;
}

describe("RQ-8", () => {
  test("Se podrá marcar un correo como leído.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);
    expect(correo.getLeido()).toBe(false);

    cliente.marcarComoLeido(correo.getId());
    expect(correo.getLeido()).toBe(true);

    // Marcarlo dos veces no genera cambios inesperados
    cliente.marcarComoLeido(correo.getId());
    expect(correo.getLeido()).toBe(true);
    expect(cliente.getEnviados().getCorreos()).toHaveLength(1);

    // No se puede marcar un correo que no existe
    expect(() => cliente.marcarComoLeido("id-inexistente")).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
  });

  test("Se podrá marcar nuevamente como no leído.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);
    cliente.marcarComoLeido(correo.getId());

    cliente.marcarComoNoLeido(correo.getId());

    expect(correo.getLeido()).toBe(false);
    expect(() => cliente.marcarComoNoLeido("id-inexistente")).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
  });

  test("El estado deberá mantenerse al consultar el correo.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.marcarComoLeido(correo.getId());

    expect(cliente.obtenerCorreo(correo.getId()).getLeido()).toBe(true);
    expect(cliente.obtenerCorreo(correo.getId()).getLeido()).toBe(true);
    expect(cliente.getEnviados().getCorreos()[0].getLeido()).toBe(true);

    // También se mantiene si el correo está en la Papelera
    cliente.eliminar(correo, cliente.getEnviados());
    expect(cliente.obtenerCorreo(correo.getId()).getLeido()).toBe(true);
    cliente.marcarComoNoLeido(correo.getId());
    expect(cliente.obtenerCorreo(correo.getId()).getLeido()).toBe(false);
  });

  test("Se deberán poder obtener todos los correos no leídos de una bandeja.", () => {
    const cliente = new ClienteCorreo();
    const enviado = crearCorreo("Enviado");
    const leido = crearCorreo("Leído");
    const eliminado = crearCorreo("Eliminado");
    cliente.enviar(enviado);
    cliente.enviar(leido);
    cliente.enviar(eliminado);
    const borrador = cliente.crearBorrador();
    cliente.marcarComoLeido(leido.getId());
    cliente.eliminar(eliminado, cliente.getEnviados());

    // De una bandeja en particular
    expect(cliente.obtenerNoLeidos(cliente.getEnviados())).toEqual([enviado]);
    expect(cliente.obtenerNoLeidos(cliente.getPapelera())).toEqual([eliminado]);

    // De todas las bandejas (la Papelera no cuenta)
    const noLeidos = cliente.obtenerNoLeidos();
    expect(noLeidos).toHaveLength(2);
    expect(noLeidos).toContain(enviado);
    expect(noLeidos).toContain(borrador);
  });

  test("El cambio de estado deberá reflejarse inmediatamente en los resultados de los filtros correspondientes.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);
    const filtro = new Filtro("No leídos", noLeido);
    expect(filtro.aplicar(cliente.getEnviados().getCorreos())).toEqual([correo]);

    cliente.marcarComoLeido(correo.getId());
    expect(filtro.aplicar(cliente.getEnviados().getCorreos())).toEqual([]);

    cliente.marcarComoNoLeido(correo.getId());
    expect(filtro.aplicar(cliente.getEnviados().getCorreos())).toEqual([correo]);
  });
});