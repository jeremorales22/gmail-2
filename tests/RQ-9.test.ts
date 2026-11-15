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

describe("RQ-9", () => {
  test("Un correo nuevo no deberá ser favorito.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    expect(correo.getFavorito()).toBe(false);
    expect(cliente.obtenerFavoritos()).toEqual([]);
  });

  test("Se podrá marcar un correo como favorito.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.marcarComoFavorito(correo.getId());

    expect(correo.getFavorito()).toBe(true);
    expect(cliente.obtenerFavoritos()).toEqual([correo]);
  });

  test("Se podrá desmarcar un correo favorito.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);
    cliente.marcarComoFavorito(correo.getId());

    cliente.desmarcarFavorito(correo.getId());

    expect(correo.getFavorito()).toBe(false);
    expect(cliente.obtenerFavoritos()).toEqual([]);
  });

  test("La vista de favoritos deberá mostrar solo los correos marcados.", () => {
    const cliente = new ClienteCorreo();
    const parcial = crearCorreo("Parcial");
    const reunion = crearCorreo("Reunión");
    const sprints = crearCorreo("Sprints");
    cliente.enviar(parcial);
    cliente.enviar(reunion);
    cliente.enviar(sprints);

    cliente.marcarComoFavorito(parcial.getId());
    cliente.marcarComoFavorito(sprints.getId());

    const favoritos = cliente.obtenerFavoritos();
    expect(favoritos).toHaveLength(2);
    expect(favoritos).toContain(parcial);
    expect(favoritos).toContain(sprints);
  });

  test("La vista de favoritos deberá incluir borradores.", () => {
    const cliente = new ClienteCorreo();
    const borrador = cliente.crearBorrador();

    cliente.marcarComoFavorito(borrador.getId());

    expect(cliente.obtenerFavoritos()).toEqual([borrador]);
  });

  test("Marcar dos veces un favorito no deberá duplicarlo en la vista.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.marcarComoFavorito(correo.getId());
    cliente.marcarComoFavorito(correo.getId());

    expect(cliente.obtenerFavoritos()).toEqual([correo]);
  });

  test("Un favorito eliminado no deberá aparecer en la vista y volverá al restaurarlo.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);
    cliente.marcarComoFavorito(correo.getId());

    cliente.eliminar(correo, cliente.getEnviados());
    expect(cliente.obtenerFavoritos()).toEqual([]);

    cliente.restaurar(correo);
    expect(cliente.obtenerFavoritos()).toEqual([correo]);
  });

  test("No se podrá marcar ni desmarcar un correo que no existe.", () => {
    const cliente = new ClienteCorreo();

    expect(() => cliente.marcarComoFavorito("id-inexistente")).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
    expect(() => cliente.desmarcarFavorito("id-inexistente")).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
  });
});