import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";

/**
 * @function passwordMatchValidator
 * @description
 * Validador personalizado para asegurar que la contraseña y su confirmación coincidan.
 *
 * @param {AbstractControl} form - El control del formulario que contiene las contraseñas.
 * @returns {ValidationErrors | null} - Devuelve null si las contraseñas coinciden, o un objeto de error si no lo hacen.
 */
export const passwordMatchValidator: ValidatorFn = (
  form: AbstractControl
): ValidationErrors | null => {
  const password = form.get("userPassword")?.value;
  const confirmPassword = form.get("confirmPassword")?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

/**
 * @function securePasswordValidator
 * @description
 * Validador personalizado para verificar la fortaleza de la contraseña.
 * Asegura que la contraseña tenga al menos 8 caracteres, incluyendo al menos
 * una letra mayúscula, una minúscula, un número y un símbolo.
 *
 * @param {AbstractControl} control - El control del formulario que contiene la contraseña.
 * @returns {ValidationErrors | null} - Devuelve null si la contraseña es segura, o un objeto de error si no lo es.
 */
export function securePasswordValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  const securePasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return securePasswordRegex.test(value) ? null : { insecurePassword: true };
}
