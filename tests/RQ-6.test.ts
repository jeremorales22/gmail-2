import { describe, expect, test } from "vitest";
import { Bandeja } from "../src/Clases/Bandeja";
import { ClienteCorreo } from "../src/Clases/ClienteCorreo";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";

function crearContacto(nombre: string, email: string): Contacto {
  const contacto = new Contacto();
  contacto.setNombre(nombre);
  contacto.setEmail(email);
  return contacto;
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
  test("Un correo se podrá mover de una bandeja a otra.", () => {
    const cliente = new ClienteCorreo();
    const trabajo = new Bandeja();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.mover(correo, cliente.getEnviados(), trabajo);

    expect(cliente.getEnviados().contiene(correo)).toBe(false);
    expect(trabajo.contiene(correo)).toBe(true);
  });

  test("No se podrá mover un correo que no está en la bandeja de origen.", () => {
    const cliente = new ClienteCorreo();
    const trabajo = new Bandeja();
    const correo = crearCorreo("Parcial");

    expect(() => cliente.mover(correo, cliente.getEnviados(), trabajo)).toThrow();
    expect(trabajo.getCorreos()).toEqual([]);
  });

  test("No se podrá mover un correo a la misma bandeja.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    expect(() => cliente.mover(correo, cliente.getEnviados(), cliente.getEnviados())).toThrow();
    expect(cliente.getEnviados().getCorreos()).toHaveLength(1);
  });

  test("Un correo eliminado deberá pasar a la Papelera.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.eliminar(correo, cliente.getEnviados());

    expect(cliente.getEnviados().contiene(correo)).toBe(false);
    expect(cliente.getPapelera().contiene(correo)).toBe(true);
  });

  test("No se podrá eliminar un correo que no está en la bandeja indicada.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");

    expect(() => cliente.eliminar(correo, cliente.getEnviados())).toThrow();
    expect(cliente.getPapelera().getCorreos()).toEqual([]);
  });

  test("Un correo restaurado deberá volver a la bandeja de donde fue eliminado.", () => {
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
  });

  test("Mover un correo a la Papelera deberá equivaler a eliminarlo.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    cliente.mover(correo, cliente.getEnviados(), cliente.getPapelera());
    cliente.restaurar(correo);

    expect(cliente.getEnviados().contiene(correo)).toBe(true);
  });

  test("No se podrá restaurar un correo que no está en la Papelera.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);

    expect(() => cliente.restaurar(correo)).toThrow();
  });

  test("Eliminar un correo desde la Papelera lo borrará definitivamente.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial");
    cliente.enviar(correo);
    cliente.eliminar(correo, cliente.getEnviados());

    cliente.eliminar(correo, cliente.getPapelera());

    expect(cliente.getPapelera().contiene(correo)).toBe(false);
    expect(cliente.getEnviados().contiene(correo)).toBe(false);
    expect(() => cliente.restaurar(correo)).toThrow();
  });
});