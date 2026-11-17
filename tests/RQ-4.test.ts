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
  test("La búsqueda no deberá distinguir entre mayúsculas y minúsculas.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial", "Estudiar");
    cliente.enviar(correo);

    expect(cliente.buscar("PARCIAL")).toEqual([correo]);
    expect(cliente.buscar("parcial")).toEqual([correo]);
    expect(cliente.buscar("PaRcIaL")).toEqual([correo]);
  });

  test("Se deberán admitir coincidencias parciales.", () => {
    const cliente = new ClienteCorreo();
    const parcial = crearCorreo("Parcial", "Estudiar programación");
    const reunion = crearCorreo("Reunión", "Traer los sprints");
    cliente.enviar(parcial);
    cliente.enviar(reunion);

    // En el asunto y en el contenido
    expect(cliente.buscar("parc")).toEqual([parcial]);
    expect(cliente.buscar("sprint")).toEqual([reunion]);

    // En el remitente y en el destinatario
    expect(cliente.buscar("ana@gm")).toHaveLength(2);
    expect(cliente.buscar("lui")).toHaveLength(2);
  });

    test("Un correo deberá aparecer una sola vez, aunque coincida con varios campos.", () => {
    const cliente = new ClienteCorreo();
    const enviado = crearCorreo("Reunión de equipo", "La reunión es el lunes");
    const borrador = crearCorreo("Proyecto nuevo", "Sin enviar");
    cliente.enviar(enviado);
    cliente.guardarBorrador(borrador);

    // "reunión" está en el asunto y en el contenido del mismo correo
    expect(cliente.buscar("reunión")).toEqual([enviado]);

    // Busca en todas las bandejas, cada correo una vez
    const resultado = cliente.buscar("@gmail.com");
    expect(resultado).toHaveLength(2);
    expect(resultado).toContain(enviado);
    expect(resultado).toContain(borrador);
  });

  test("Se deberá devolver una colección vacía cuando no existan coincidencias.", () => {
    const cliente = new ClienteCorreo();
    cliente.enviar(crearCorreo("Parcial", "Estudiar"));

    expect(cliente.buscar("vacaciones")).toEqual([]);
    expect(cliente.buscar("")).toEqual([]);
    expect(cliente.buscar("   ")).toEqual([]);
  });

  test("La búsqueda no deberá modificar los correos originales.", () => {
    const cliente = new ClienteCorreo();
    const correo = crearCorreo("Parcial", "Estudiar");
    cliente.enviar(correo);

    cliente.buscar("Parcial").pop();

    expect(cliente.getEnviados().contiene(correo)).toBe(true);
    expect(correo.getAsunto()).toBe("Parcial");
    expect(correo.getContenido()).toBe("Estudiar");
    expect(correo.getLeido()).toBe(false);
    expect(correo.getFavorito()).toBe(false);
  });

  test("Se deberán contemplar búsquedas sobre bandejas vacías.", () => {
    const cliente = new ClienteCorreo();

    expect(cliente.buscar("x")).toEqual([]);
    expect(cliente.buscar("")).toEqual([]);
  });
});