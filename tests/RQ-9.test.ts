import { describe, expect, test } from "vitest";
import { ClienteCorreo } from "../src/Clases/ClienteCorreo";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";
import { and, conTexto, Filtro, noLeido } from "../src/Clases/Filtros";

function crearCorreo(asunto: string): Correo {
  const correo = new Correo();
  correo.setAsunto(asunto);
  correo.setContenido("Contenido de " + asunto);
  correo.setRemitente(new Contacto("Ana", "ana@gmail.com"));
  correo.setDestinatarios([new Contacto("Luis", "luis@gmail.com")]);
  return correo;
}

describe("RQ-9", () => {
  test("Un correo podrá marcarse o desmarcarse como favorito.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);
    expect(correo.getFavorito()).toBe(false);

    cliente.marcarComoFavorito(correo.getId());
    expect(correo.getFavorito()).toBe(true);
    expect(cliente.obtenerFavoritos()).toEqual([correo]);

    cliente.desmarcarFavorito(correo.getId());
    expect(correo.getFavorito()).toBe(false);
    expect(cliente.obtenerFavoritos()).toEqual([]);

    // No se puede marcar ni desmarcar un correo que no existe
    expect(() => cliente.marcarComoFavorito("id-inexistente")).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
    expect(() => cliente.desmarcarFavorito("id-inexistente")).toThrow(
      expect.objectContaining({ name: "CORREO_NO_ENCONTRADO" }),
    );
  });

  test("Se podrán consultar todos los correos favoritos.", () => {
    const cliente = new ClienteCorreo();
    const parcial = crearCorreo("Parcial");
    const reunion = crearCorreo("Reunión");
    const sprints = crearCorreo("Sprints");
    cliente.enviar(parcial);
    cliente.enviar(reunion);
    cliente.enviar(sprints);
    const borrador = cliente.crearBorrador();

    cliente.marcarComoFavorito(parcial.getId());
    cliente.marcarComoFavorito(sprints.getId());
    cliente.marcarComoFavorito(borrador.getId());

    const favoritos = cliente.obtenerFavoritos();
    expect(favoritos).toHaveLength(3);
    expect(favoritos).toContain(parcial);
    expect(favoritos).toContain(sprints);
    expect(favoritos).toContain(borrador);
    expect(favoritos).not.toContain(reunion);
  });

  test("Se podrán combinar filtros para buscar dentro de la colección de favoritos.", () => {
    const cliente = new ClienteCorreo();
    const proyecto = crearCorreo("Proyecto");
    const proyectoLeido = crearCorreo("Proyecto viejo");
    const parcial = crearCorreo("Parcial");
    const proyectoNoFavorito = crearCorreo("Proyecto nuevo");
    [proyecto, proyectoLeido, parcial, proyectoNoFavorito].forEach((c) => cliente.enviar(c));
    [proyecto, proyectoLeido, parcial].forEach((c) => cliente.marcarComoFavorito(c.getId()));
    cliente.marcarComoLeido(proyectoLeido.getId());

    const filtro = new Filtro("Proyectos sin leer", and(conTexto("proyecto"), noLeido));

    expect(filtro.aplicar(cliente.obtenerFavoritos())).toEqual([proyecto]);
  });

  test("Marcar un correo como favorito no deberá moverlo de su bandeja original.", () => {
    const cliente = new ClienteCorreo();
    const enviado = crearCorreo("Parcial");
    cliente.enviar(enviado);
    const borrador = cliente.crearBorrador();

    cliente.marcarComoFavorito(enviado.getId());
    cliente.marcarComoFavorito(borrador.getId());

    expect(cliente.getEnviados().contiene(enviado)).toBe(true);
    expect(cliente.getEnviados().getCorreos()).toHaveLength(1);
    expect(cliente.getBorradores().contiene(borrador)).toBe(true);
    expect(cliente.getBorradores().contiene(enviado)).toBe(false);
    expect(cliente.getPapelera().getCorreos()).toEqual([]);
  });

  test("No deberán existir duplicados al consultar favoritos.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.marcarComoFavorito(correo.getId());
    cliente.marcarComoFavorito(correo.getId());

    expect(cliente.obtenerFavoritos()).toEqual([correo]);
    expect(cliente.obtenerFavoritos()).toEqual([correo]);
  });

  test("Los correos eliminados permanecerán en Eliminados y no aparecerán en la vista habitual de favoritos hasta su restauración, conservando su indicador de favorito.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);
    cliente.marcarComoFavorito(correo.getId());

    cliente.eliminar(correo, cliente.getEnviados());
    expect(cliente.getPapelera().contiene(correo)).toBe(true);
    expect(cliente.obtenerFavoritos()).toEqual([]);
    expect(correo.getFavorito()).toBe(true);

    cliente.restaurar(correo);
    expect(cliente.getEnviados().contiene(correo)).toBe(true);
    expect(cliente.obtenerFavoritos()).toEqual([correo]);
    expect(correo.getFavorito()).toBe(true);
  });
});