import { beforeEach, describe, expect, test } from "vitest";
import { Bandeja } from "../src/Clases/Bandeja";
import { Contacto } from "../src/Clases/Contacto";
import { Correo } from "../src/Clases/Correo";
import {
  and,
  conTexto,
  deRemitente,
  esFavorito,
  Filtro,
  noLeido,
  not,
  or,
  Predicado,
} from "../src/Clases/Filtros";
import { RegistroFiltros } from "../src/Clases/RegistroFiltros";

const REMITENTES = [
  new Contacto("Ana", "ana@ucp.edu.ar"),
  new Contacto("Luis", "luis@ucp.edu.ar"),
  new Contacto("Marta", "marta@gmail.com"),
  new Contacto("Pedro", "pedro@gmail.com"),
];

const ASUNTOS = [
  "Examen final",
  "Proyecto sprint",
  "Reunión de equipo",
  "Aviso general",
  "Entrega TP",
];

/* Datos de cada correo, calculados aparte para tener un resultado esperado
   que no dependa de los filtros que se están probando */
interface Dato {
  correo: Correo;
  email: string;
  esUcp: boolean;
  asunto: string;
  mencionaEntrega: boolean;
  leido: boolean;
  favorito: boolean;
}

function crearDatos(): Dato[] {
  const destino = new Contacto("Destino", "destino@correo.com");

  return Array.from({ length: 100 }, (_, i) => {
    const remitente = REMITENTES[i % 4];
    const asunto = ASUNTOS[i % 5];
    const contenido =
      i % 3 === 0 ? "Recordatorio de entrega" : "Sin novedades por ahora";

    const correo = new Correo();
    correo.setAsunto(`${asunto} #${i}`);
    correo.setContenido(contenido);
    correo.setRemitente(remitente);
    correo.setDestinatarios([destino]);
    correo.setLeido(i % 2 === 0);
    correo.setFavorito(i % 7 === 0);

    return {
      correo,
      email: remitente.getEmail(),
      esUcp: i % 4 < 2,
      asunto,
      mencionaEntrega: i % 3 === 0 || asunto === "Entrega TP",
      leido: i % 2 === 0,
      favorito: i % 7 === 0,
    };
  });
}

const deDominio =
  (dominio: string): Predicado =>
  (correo) =>
    correo.getRemitente().getEmail().toLowerCase().endsWith(dominio);

/* Los ids de lo que debería devolver un filtro, según los datos */
function idsEsperados(datos: Dato[], condicion: (d: Dato) => boolean) {
  return datos
    .filter(condicion)
    .map((d) => d.correo.getId())
    .sort();
}

function ids(correos: Correo[]) {
  return correos.map((c) => c.getId()).sort();
}

describe("Test 2: 100 correos en una bandeja con distintos filtros", () => {
  let datos: Dato[];
  let bandeja: Bandeja;
  let registro: RegistroFiltros;

  beforeEach(() => {
    datos = crearDatos();
    bandeja = new Bandeja();
    bandeja.setNombre("Recibidos");
    datos.forEach((d) => bandeja.agregarCorreo(d.correo));

    registro = new RegistroFiltros();
    registro.agregarFiltro(
      new Filtro("Correos de la UCP", deDominio("@ucp.edu.ar")),
    );
    registro.agregarFiltro(
      new Filtro(
        "Correos académicos importantes",
        and(deDominio("@ucp.edu.ar"), conTexto("Examen"), noLeido),
      ),
    );
    registro.agregarFiltro(
      new Filtro("Pendientes de revisión", and(noLeido, conTexto("Entrega"))),
    );
    registro.agregarFiltro(
      new Filtro(
        "Correos personales prioritarios",
        and(esFavorito, deRemitente("marta@gmail.com")),
      ),
    );
    registro.agregarFiltro(
      new Filtro(
        "Correos para seguimiento",
        and(or(conTexto("Proyecto"), conTexto("Reunión")), noLeido),
      ),
    );
  });

  test("La bandeja contiene los 100 correos, todos distintos.", () => {
    const correos = bandeja.getCorreos();

    expect(correos).toHaveLength(100);
    expect(new Set(correos.map((c) => c.getId())).size).toBe(100);
  });

  test("Correos de la UCP: remitente del dominio @ucp.edu.ar.", () => {
    const resultado = registro.aplicarFiltro(
      "Correos de la UCP",
      bandeja.getCorreos(),
    );

    expect(resultado).toHaveLength(50);
    expect(ids(resultado)).toEqual(idsEsperados(datos, (d) => d.esUcp));
  });

  test("Correos académicos importantes: UCP, asunto con Examen y no leídos.", () => {
    const resultado = registro.aplicarFiltro(
      "Correos académicos importantes",
      bandeja.getCorreos(),
    );

    expect(resultado).toHaveLength(5);
    expect(ids(resultado)).toEqual(
      idsEsperados(
        datos,
        (d) => d.esUcp && d.asunto === "Examen final" && !d.leido,
      ),
    );
  });

  test("Pendientes de revisión: no leídos que mencionan Entrega.", () => {
    const resultado = registro.aplicarFiltro(
      "Pendientes de revisión",
      bandeja.getCorreos(),
    );

    expect(resultado).toHaveLength(23);
    expect(ids(resultado)).toEqual(
      idsEsperados(datos, (d) => !d.leido && d.mencionaEntrega),
    );
  });

  test("Correos personales prioritarios: favoritos de un contacto.", () => {
    const resultado = registro.aplicarFiltro(
      "Correos personales prioritarios",
      bandeja.getCorreos(),
    );

    expect(resultado).toHaveLength(4);
    expect(ids(resultado)).toEqual(
      idsEsperados(datos, (d) => d.favorito && d.email === "marta@gmail.com"),
    );
  });

  test("Correos para seguimiento: Proyecto o Reunión, excluyendo los leídos.", () => {
    const resultado = registro.aplicarFiltro(
      "Correos para seguimiento",
      bandeja.getCorreos(),
    );

    expect(resultado).toHaveLength(20);
    expect(ids(resultado)).toEqual(
      idsEsperados(
        datos,
        (d) =>
          (d.asunto === "Proyecto sprint" ||
            d.asunto === "Reunión de equipo") &&
          !d.leido,
      ),
    );
  });

  test("Los filtros se pueden combinar con NOT y OR.", () => {
    const noUcp = new Filtro("No UCP", not(deDominio("@ucp.edu.ar")));
    const ucpOFavorito = new Filtro(
      "UCP o favorito",
      or(deDominio("@ucp.edu.ar"), esFavorito),
    );

    const resultadoNoUcp = noUcp.aplicar(bandeja.getCorreos());
    expect(resultadoNoUcp).toHaveLength(50);
    expect(ids(resultadoNoUcp)).toEqual(idsEsperados(datos, (d) => !d.esUcp));
    expect(ids(ucpOFavorito.aplicar(bandeja.getCorreos()))).toEqual(
      idsEsperados(datos, (d) => d.esUcp || d.favorito),
    );
    expect(ucpOFavorito.aplicar(bandeja.getCorreos())).toHaveLength(58);
  });

  test("Aplicar los filtros no modifica la bandeja ni los correos.", () => {
    for (const filtro of registro.getFiltros()) {
      registro.aplicarFiltro(filtro.getNombre(), bandeja.getCorreos());
    }

    const correos = bandeja.getCorreos();
    expect(correos).toHaveLength(100);
    expect(correos.filter((c) => c.getLeido())).toHaveLength(50);
    expect(correos.filter((c) => c.getFavorito())).toHaveLength(15);
    expect(ids(correos)).toEqual(ids(datos.map((d) => d.correo)));
  });

  test("Un mismo filtro se puede aplicar sobre otra colección.", () => {
    const primeros10 = datos.slice(0, 10).map((d) => d.correo);

    const resultado = registro.aplicarFiltro("Correos de la UCP", primeros10);

    expect(resultado).toHaveLength(6);
    expect(ids(resultado)).toEqual(
      idsEsperados(datos.slice(0, 10), (d) => d.esUcp),
    );
  });

  test("Los cambios en los correos se reflejan en el filtro sin registrarlo de nuevo.", () => {
    const antes = registro.aplicarFiltro(
      "Pendientes de revisión",
      bandeja.getCorreos(),
    );
    expect(antes).toHaveLength(23);

    antes[0].setLeido(true);

    const despues = registro.aplicarFiltro(
      "Pendientes de revisión",
      bandeja.getCorreos(),
    );
    expect(despues).toHaveLength(22);
    expect(despues.map((c) => c.getId())).not.toContain(antes[0].getId());
  });
});
