/**
 * Interfaz para la respuesta global de la API.
 * Puedes ajustar los campos según la estructura real de tu backend.
 * @interface GlobalResponse
 * @template T - Tipo de datos que contiene la respuesta.
 * @property {T} data - Los datos de la respuesta.
 * @property {string} [message] - Mensaje opcional de la respuesta.
 * @property {boolean} [success] - Indica si la operación fue exitosa.
 * @property {any} [key: string] - Cualquier otro campo adicional.
 */
export interface GlobalResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
  [key: string]: any;
}
