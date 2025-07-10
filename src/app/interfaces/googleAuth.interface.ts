import { IUser } from ".";

/**
 * @interface IGoogleAuthResponse
 * Define la estructura de la respuesta de nuestro endpoint /auth/google/callback.
 */
export interface IGoogleAuthResponse {
  status: 'LOGIN_SUCCESS' | 'REGISTRATION_REQUIRED';
  token: string;
  authUser?: IUser;
}

/**
 * @interface IRegistrationTokenPayload
 * Define la estructura de los datos decodificados del token de registro temporal.
 */
export interface IRegistrationTokenPayload {
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
  iat: number;
  exp: number;
}