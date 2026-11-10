import { expect, test } from "vitest";
import { ClienteCorreo } from "../src/Clases/ClienteCorreo";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";

function crearCorreo(): Correo {
  const ana = new Contacto();
  ana.setNombre("Ana");
  ana.setEmail("ana@gmail.com");

  const luis = new Contacto();
  luis.setNombre("Luis");
  luis.setEmail("luis@gmail.com");

  const marta = new Contacto();
  marta.setNombre("Marta");
  marta.setEmail("marta@gmail.com");

  const correo = new Correo();
  correo.setAsunto("Reunión");
  correo.setContenido("Nos vemos mañana");
  correo.setRemitente(ana);
  correo.setDestinatarios([luis]);
  return correo;
}

test("Un correo podrá enviarse a múltiples destinatarios.", () => {
  const ana = new Contacto();
  ana.setNombre("Ana");
  ana.setEmail("ana@gmail.com");

  const luis = new Contacto();
  luis.setNombre("Luis");
  luis.setEmail("luis@gmail.com");

  const marta = new Contacto();
  marta.setNombre("Marta");
  marta.setEmail("marta@gmail.com");

  const cliente = new ClienteCorreo();
  const correo = crearCorreo();
  correo.setDestinatarios([luis, marta]);

  cliente.enviar(correo);

  expect(cliente.getEnviados().contiene(correo)).toBe(true);
  expect(correo.getDestinatarios()).toEqual([luis, marta]);
});

test("Para enviar un correo, deberá existir un remitente, un asunto válido y al menos un destinatario.", () => {
  const ana = new Contacto();
  ana.setNombre("Ana");
  ana.setEmail("ana@gmail.com");

  const luis = new Contacto();
  luis.setNombre("Luis");
  luis.setEmail("luis@gmail.com");

  const cliente = new ClienteCorreo();

  // Sin remitente
  const sinRemitente = crearCorreo();
  sinRemitente.setRemitente(new Contacto());
  expect(() => cliente.enviar(sinRemitente)).toThrow(
    expect.objectContaining({ name: "CAMPO_OBLIGATORIO" }),
  );

  // Sin asunto
  const sinAsunto = new Correo();
  sinAsunto.setRemitente(ana);
  sinAsunto.setDestinatarios([luis]);
  expect(() => cliente.enviar(sinAsunto)).toThrow(
    expect.objectContaining({ name: "CAMPO_OBLIGATORIO" }),
  );

  // Sin destinatarios
  const sinDestinatarios = new Correo();
  sinDestinatarios.setAsunto("Reunión");
  sinDestinatarios.setRemitente(ana);
  expect(() => cliente.enviar(sinDestinatarios)).toThrow(
    expect.objectContaining({ name: "CAMPO_OBLIGATORIO" }),
  );

  // Ninguno quedó registrado como enviado
  expect(cliente.getEnviados().getCorreos()).toEqual([]);
});

test("Un correo enviado deberá encontrarse en la Bandeja de Enviados.", () => {
  const cliente = new ClienteCorreo();
  const correo = crearCorreo();

  cliente.enviar(correo);

  expect(cliente.getEnviados().contiene(correo)).toBe(true);
  expect(correo.getFechaEnvio()).toBeInstanceOf(Date);
});

test("Un correo enviado desde Borradores deberá dejar de pertenecer a esa bandeja.", () => {
  const cliente = new ClienteCorreo();
  const correo = crearCorreo();
  cliente.getBorradores().agregarCorreo(correo);

  cliente.enviar(correo);

  expect(cliente.getBorradores().contiene(correo)).toBe(false);
  expect(cliente.getEnviados().contiene(correo)).toBe(true);
});

test("El sistema deberá evitar que una misma operación de envío genere registros duplicados.", () => {
  const cliente = new ClienteCorreo();
  const correo = crearCorreo();

  cliente.enviar(correo);
  cliente.enviar(correo);

  expect(cliente.getEnviados().getCorreos()).toHaveLength(1);
});
