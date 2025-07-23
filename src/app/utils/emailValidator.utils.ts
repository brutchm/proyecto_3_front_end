/**
 * Valida si una dirección de correo electrónico tiene un formato válido.
 * 
 * @description
 * Esta función utiliza una expresión regular para verificar que el correo electrónico
 * tenga un formato básico válido. La validación incluye:
 * - Al menos un carácter antes del símbolo @
 * - El símbolo @ una sola vez
 * - Al menos un carácter después del @ y antes del punto
 * - Al menos un punto seguido de una extensión de dominio
 * 
 * @param {string} email - La dirección de correo electrónico a validar
 * @returns {boolean} `true` si el email tiene un formato válido, `false` en caso contrario
 * 
 * @example
 * ```typescript
 * validateEmail('usuario@ejemplo.com'); // returns true
 * validateEmail('correo.valido@dominio.co.cr'); // returns true
 * validateEmail('invalido@'); // returns false
 * validateEmail('@dominio.com'); // returns false
 * validateEmail('sin-arroba.com'); // returns false
 * ```
 */
export function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}