export type Funcion = (valor: any) => any;
/* pipe recibe varias funciones y devuelve una sola que las aplica en orden:
   la salida de cada una es la entrada de la siguiente */
export function pipe(...funciones: Funcion[]): Funcion {
  return (valor) =>
    funciones.reduce((acumulado, funcion) => funcion(acumulado), valor);
}