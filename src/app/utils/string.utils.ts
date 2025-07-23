/**
 * Convierte un string a formato Title Case (ej. "hola mundo" -> "Hola Mundo").
 * Elimina múltiples espacios y los convierte en uno solo.
 *
 * @param {string | null | undefined} str - El string de entrada a convertir.
 * @returns {string} El string convertido a Title Case, o un string vacío si la entrada es nula.
 */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) {
    return '';
  }

  // Usa una expresión regular para encontrar la primera letra de cada palabra y convertirla a mayúscula.
  return str.trim().replace(/\s+/g, ' ').replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

/**
 * @typedef {object} SplitNameResult
 * @property {string} first - La primera parte del nombre/apellido.
 * @property {string} rest - El resto del nombre/apellido.
 */
interface SplitNameResult {
  first: string;
  rest: string;
}

/**
 * @function splitFullName
 * @description
 * Divide un string (típicamente un nombre completo o apellidos) en dos partes:
 * la primera palabra y el resto del string. Formatea ambas partes a Title Case.
 *
 * @param {string | null | undefined} fullName - El string completo a dividir.
 * @returns {SplitNameResult} Un objeto con la primera parte (`first`) y el resto (`rest`).
 *
 * @example
 * // returns { first: "Perez", rest: "Rodriguez" }
 * splitFullName("perez rodriguez");
 *
 * @example
 * // returns { first: "Perez", rest: "" }
 * splitFullName("  perez  ");
 */
export function splitFullName(fullName: string | null | undefined): SplitNameResult {
  if (!fullName) {
    return { first: '', rest: '' };
  }

  const trimmedName = fullName.trim().replace(/\s+/g, ' ');
  const firstSpaceIndex = trimmedName.indexOf(' ');

  if (firstSpaceIndex === -1) {
    // No hay espacios, todo el nombre es la primera parte.
    return {
      first: toTitleCase(trimmedName),
      rest: ''
    };
  }

  // Hay espacios, se divide el nombre.
  const firstPart = trimmedName.substring(0, firstSpaceIndex);
  const restPart = trimmedName.substring(firstSpaceIndex + 1);

  return {
    first: toTitleCase(firstPart),
    rest: toTitleCase(restPart)
  };
}
