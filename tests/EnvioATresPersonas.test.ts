import { describe, expect, test } from "vitest";
import { ClienteCorreo } from "../src/Clases/ClienteCorreo";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";
import { ServidorCorreo } from "../src/Clases/ServidorCorreo";

function crearEscenario() {
  const servidor = new ServidorCorreo();

  const ana = new Contacto("Ana", "ana@gmail.com");
  const luis = new Contacto("Luis", "luis@gmail.com");
  const marta = new Contacto("Marta", "marta@gmail.com");
  const pedro = new Contacto("Pedro", "pedro@gmail.com");

  const clientes = {
    ana: servidor.registrar(ana),
    luis: servidor.registrar(luis),
    marta: servidor.registrar(marta),
    pedro: servidor.registrar(pedro),
  };

  const correo = new Correo();
  correo.setAsunto("Reunión de proyecto");
  correo.setContenido("Nos vemos el lunes a las 10");
  correo.setRemitente(ana);
  correo.setDestinatarios([luis, marta, pedro]);

  return { servidor, clientes, correo, destinatarios: [luis, marta, pedro] };
}

/* Un correo "existe" para una persona si está en cualquiera de sus bandejas */
function existeEn(cliente: ClienteCorreo, correo: Correo): boolean {
  return [
    cliente.getRecibidos(),
    cliente.getEnviados(),
    cliente.getBorradores(),
    cliente.getPapelera(),
  ].some((bandeja) => bandeja.contiene(correo));
}

describe("Test 1: un mismo correo enviado a 3 personas distintas", () => {
  test("El mismo correo llega a las 3 personas.", () => {
    const { servidor, clientes, correo, destinatarios } = crearEscenario();

    servidor.enviar(correo);

    for (const cliente of [clientes.luis, clientes.marta, clientes.pedro]) {
      const recibidos = cliente.getRecibidos().getCorreos();
      expect(recibidos).toHaveLength(1);

      const recibido = recibidos[0];
      expect(recibido.getId()).toBe(correo.getId());
      expect(recibido.getAsunto()).toBe("Reunión de proyecto");
      expect(recibido.getContenido()).toBe("Nos vemos el lunes a las 10");
      expect(recibido.getRemitente().getEmail()).toBe("ana@gmail.com");
      expect(recibido.getDestinatarios().map((d) => d.getEmail())).toEqual(
        destinatarios.map((d) => d.getEmail()),
      );
    }
  });

  test("Cada persona que recibió el correo lo tiene en su Bandeja de recibidos.", () => {
    const { servidor, clientes, correo } = crearEscenario();

    servidor.enviar(correo);

    for (const cliente of [clientes.luis, clientes.marta, clientes.pedro]) {
      expect(cliente.getRecibidos().contiene(correo)).toBe(true);
      expect(cliente.getEnviados().contiene(correo)).toBe(false);
      expect(cliente.getBorradores().contiene(correo)).toBe(false);
    }
  });

  test("La persona que envió el correo lo tiene en su Bandeja de enviados.", () => {
    const { servidor, clientes, correo } = crearEscenario();

    servidor.enviar(correo);

    expect(clientes.ana.getEnviados().contiene(correo)).toBe(true);
    expect(clientes.ana.getEnviados().getCorreos()).toHaveLength(1);
    expect(clientes.ana.getRecibidos().contiene(correo)).toBe(false);
  });

  test("Cada persona recibe su propia copia, con su propio estado de lectura.", () => {
    const { servidor, clientes, correo } = crearEscenario();

    servidor.enviar(correo);
    const copiaLuis = clientes.luis.getRecibidos().getCorreos()[0];
    const copiaMarta = clientes.marta.getRecibidos().getCorreos()[0];
    copiaLuis.setLeido(true);

    expect(copiaLuis).not.toBe(correo);
    expect(copiaLuis).not.toBe(copiaMarta);
    expect(copiaMarta.getLeido()).toBe(false);
    expect(correo.getLeido()).toBe(false);
  });

  test.each(["ana", "luis", "marta", "pedro"] as const)(
    "Al eliminar el correo de %s ya no existe para esa persona y el resto lo conserva.",
    (quien) => {
      const { servidor, clientes, correo } = crearEscenario();
      servidor.enviar(correo);

      const cliente = clientes[quien];
      const bandeja =
        quien === "ana" ? cliente.getEnviados() : cliente.getRecibidos();
      const suyo = bandeja.getCorreos()[0];

      // Eliminación lógica (a la Papelera) y luego definitiva
      cliente.eliminar(suyo, bandeja);
      expect(bandeja.contiene(correo)).toBe(false);
      expect(cliente.getPapelera().contiene(correo)).toBe(true);

      cliente.eliminar(suyo, cliente.getPapelera());
      expect(existeEn(cliente, correo)).toBe(false);

      // El resto de las personas sigue teniéndolo
      const resto = (["ana", "luis", "marta", "pedro"] as const).filter(
        (nombre) => nombre !== quien,
      );
      for (const nombre of resto) {
        expect(existeEn(clientes[nombre], correo)).toBe(true);
      }
    },
  );

  test("Enviar dos veces el mismo correo no genera duplicados.", () => {
    const { servidor, clientes, correo } = crearEscenario();

    servidor.enviar(correo);
    servidor.enviar(correo);

    expect(clientes.ana.getEnviados().getCorreos()).toHaveLength(1);
    expect(clientes.luis.getRecibidos().getCorreos()).toHaveLength(1);
  });

  test("No se entrega a nadie si algún destinatario no está registrado.", () => {
    const { servidor, clientes, correo, destinatarios } = crearEscenario();
    correo.setDestinatarios([
      ...destinatarios,
      new Contacto("Fantasma", "fantasma@gmail.com"),
    ]);

    expect(() => servidor.enviar(correo)).toThrow(
      expect.objectContaining({ name: "CLIENTE_NO_REGISTRADO" }),
    );
    expect(clientes.ana.getEnviados().contiene(correo)).toBe(false);
    expect(clientes.luis.getRecibidos().contiene(correo)).toBe(false);
  });

  test("Registrar dos veces al mismo contacto devuelve el mismo cliente.", () => {
    const { servidor, clientes } = crearEscenario();

    const otraVez = servidor.registrar(new Contacto("Ana", "ANA@gmail.com"));

    expect(otraVez).toBe(clientes.ana);
  });
});
