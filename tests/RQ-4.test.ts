import { describe, expect, test } from "vitest";
import { ClienteCorreo } from "../src/Clases/ClienteCorreo";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";

function crearContacto(nombre: string, email: string): Contacto {
  return new Contacto(nombre, email);
}

function crearCorreo(asunto: string, contenido: string): Correo {
  const correo = new Correo();
  correo.setAsunto(asunto);
  correo.setContenido(contenido);
  correo.setRemitente(crearContacto("Ana", "ana@gmail.com"));
  correo.setDestinatarios([crearContacto("Luis", "luis@gmail.com")]);
  return correo;
}

describe("RQ-4", () => {
  test("Se podrán buscar correos por su asunto o contenido.", () => {
    const cliente = new ClienteCorreo();
    const parcial = crearCorreo("Parcial", "Estudiar programación");
    const reunion = crearCorreo("Reunión", "Traer los sprints");
    cliente.enviar(parcial);
    cliente.enviar(reunion);

    expect(cliente.buscar("Parcial")).toEqual([parcial]);
    expect(cliente.buscar("sprints")).toEqual([reunion]);
  });

  test("Se podrán buscar correos por remitente o destinatario.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial", "Estudiar");
    cliente.enviar(correo);

    expect(cliente.buscar("ana@gmail.com")).toEqual([correo]);
    expect(cliente.buscar("Luis")).toEqual([correo]);
  });

  test("La búsqueda no deberá distinguir mayúsculas de minúsculas.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial", "Estudiar");
    cliente.enviar(correo);

    expect(cliente.buscar("PARCIAL")).toEqual([correo]);
    expect(cliente.buscar("parc")).toEqual([correo]);
  });

  test("La búsqueda deberá incluir correos de distintas bandejas.", () => {
    const cliente = new ClienteCorreo();
    const enviado = crearCorreo("Proyecto final", "Enviado");
    const borrador = crearCorreo("Proyecto nuevo", "Sin enviar");
    cliente.enviar(enviado);
    cliente.getBorradores().agregarCorreo(borrador);

    const resultado = cliente.buscar("proyecto");

    expect(resultado).toHaveLength(2);
    expect(resultado).toContain(enviado);
    expect(resultado).toContain(borrador);
  });

  test("Si no hay coincidencias o el texto está vacío, el resultado será una lista vacía.", () => {
    const cliente = new ClienteCorreo();
    cliente.enviar(crearCorreo("Parcial", "Estudiar"));

    expect(cliente.buscar("vacaciones")).toEqual([]);
    expect(cliente.buscar("")).toEqual([]);
    expect(cliente.buscar("   ")).toEqual([]);
  });

  test("La búsqueda no deberá modificar las bandejas.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial", "Estudiar");
    cliente.enviar(correo);

    cliente.buscar("Parcial").pop();

    expect(cliente.getEnviados().contiene(correo)).toBe(true);
  });

  test("contieneTexto deberá funcionar en un correo sin remitente.", () => {
    const correo = new Correo();
    correo.setAsunto("Parcial");

    expect(correo.contieneTexto("parcial")).toBe(true);
    expect(correo.contieneTexto("ana")).toBe(false);
  });
});
