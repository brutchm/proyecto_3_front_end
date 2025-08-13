import { inject, Injectable, NgZone } from '@angular/core';
import { IAuthority, ILoginResponse, IResponse, IRoleType, IUser } from '../interfaces';
import { IGoogleAuthResponse, IRegistrationTokenPayload } from '../interfaces/googleAuth.interface';
import { Observable, firstValueFrom, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken!: string;
  private expiresIn! : number;
  private user: IUser = {userEmail: '', authorities: []};

  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);
  private messageService: MessageService = inject(MessageService);
  private zone: NgZone = inject(NgZone);

  constructor() {
    this.load();
  }

  public save(): void {
    if (this.user) localStorage.setItem('auth_user', JSON.stringify(this.user));

    if (this.accessToken)
      localStorage.setItem('access_token', JSON.stringify(this.accessToken));

    if (this.expiresIn)
      localStorage.setItem('expiresIn', JSON.stringify(this.expiresIn));
  }

  private load(): void {
    let token = localStorage.getItem('access_token');
    if (token) this.accessToken = token;
    let exp = localStorage.getItem('expiresIn');
    if (exp) this.expiresIn = JSON.parse(exp);
    const user = localStorage.getItem('auth_user');
    if (user) this.user = JSON.parse(user);
  }

  public getUser(): IUser | undefined {
    return this.user;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public check(): boolean {
    if (!this.accessToken) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Determina la URL del dashboard apropiado basado en el rol del usuario.
   * @returns La URL del dashboard correspondiente.
   */
  public getHomeUrlForUser(): string {
    // Usamos IRoleType.admin como lo tienes en tus rutas para el dashboard de corporación.
    if (this.hasRole(IRoleType.admin)) {
      return '/app/dashboard-corporation';
    }
    // Para cualquier otro rol autenticado, se dirige al dashboard estándar.
    return '/app/dashboard';
  }

  public login(credentials: {
    userEmail: string;
    userPassword: string;
  }): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>('auth/login', credentials).pipe(
      tap((response: any) => {
        const data = response.data;
        if (!data) {
          console.error("Login failed:", response);
          return;
        }
        this.accessToken = data.token;
        this.user.userEmail = data.authUser?.userEmail;
        this.expiresIn = data.expiresIn;
        this.user = data.authUser;
        this.save();
      })
    );
  }

  public hasRole(role: string): boolean {
    return this.user.authorities ? this.user?.authorities.some(authority => authority.authority == role) : false;
  }

  public isSuperAdmin(): boolean {
    return this.user.authorities ? this.user?.authorities.some(authority => authority.authority == IRoleType.superAdmin) : false;
  }

  public hasAnyRole(roles: any[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  public getPermittedRoutes(routes: any[]): any[] {
    let permittedRoutes: any[] = [];
    for (const route of routes) {
      if (route.data && route.data.authorities) {
        if (this.hasAnyRole(route.data.authorities)) {
          permittedRoutes.unshift(route);
        }
      }
    }
    return permittedRoutes;
  }

  public signup(user: IUser): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>('auth/signup', user);
  }

  public logout(message?: string) {
    this.accessToken = '';
    localStorage.removeItem('access_token');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('auth_user');

    if (message) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: message,
      });
    }

    this.router.navigateByUrl('/login');
  }

  public getUserAuthorities(): IAuthority[] | undefined {
    return this.getUser()?.authorities ? this.getUser()?.authorities : [];
  }

  public areActionsAvailable(routeAuthorities: string[]): boolean {
    // definición de las variables de validación
    let allowedUser: boolean = false;
    let isAdmin: boolean = false;
    // se obtienen los permisos del usuario
    let userAuthorities = this.getUserAuthorities();
    // se valida que sea una ruta permitida para el usuario
    for (const authority of routeAuthorities) {
      if (userAuthorities?.some(item => item.authority == authority)) {
        allowedUser = userAuthorities?.some(item => item.authority == authority)
      }
      if (allowedUser) break;
    }
    // se valida que el usuario tenga un rol de administración
    if (userAuthorities?.some(item => item.authority == IRoleType.admin || item.authority == IRoleType.user)) {
      isAdmin = userAuthorities?.some(item => item.authority == IRoleType.admin || item.authority == IRoleType.user);
    }
    return allowedUser && isAdmin;
  }

  public resetPasswordRequest(email: string): Observable<any> {
    return this.http.post<any>('auth/reset-password/request', { email });
  }

  public resetPassword(data: { email: string; code: string; newPassword: string }): Observable<any> {
    return this.http.post<any>('auth/reset-password/reset', data);
  }
  /**
   * Centraliza el almacenamiento de la sesión del usuario.
   * @param {string} token - El token JWT de la sesión.
   * @param {IUser} user - El objeto del usuario autenticado.
   */
  public storeSession(token: string, user: IUser): void {
    this.accessToken = token;
    this.user = user;
    this.save();
  }

  /**
   * Llama al endpoint del backend para intercambiar el código de Google por un token.
   * @param {string} code - El código de autorización proveído por Google.
   * @returns {Observable<IGoogleAuthResponse>} Un observable con la respuesta del backend.
   */
  public handleGoogleCallback(code: string): Observable<IGoogleAuthResponse> {
    return this.http.post<IGoogleAuthResponse>('auth/google/callback', { code });
  }

  /**
   * Decodifica el token de registro temporal para obtener los datos del usuario.
   * @returns {IRegistrationTokenPayload | null} Los datos del usuario o null si el token no existe.
   */
  public getRegistrationData(): IRegistrationTokenPayload | null {
    const token = localStorage.getItem('registration_token');
    if (!token) {
      return null;
    }
    try {
      return jwtDecode<IRegistrationTokenPayload>(token);
    } catch (error) {
      console.error("Error decodificando el token de registro:", error);
      return null;
    }
  }

  /**
   * Llama al endpoint para finalizar el registro de un usuario estándar con datos de Google.
   * @param {string} registrationToken - token temporal
   * @param {Partial<IUser>} userData - datos adicionales del formulario de registro.
   * @returns {Observable<IUser>} El usuario recién creado.
   */
  public completeGoogleUserSignup(registrationToken: string, userData: Partial<IUser>): Observable<IUser> {
    const payload = { registrationToken, userData };
    return this.http.post<IUser>('auth/google-signup/user', payload);
  }

  /**
   * Llama al endpoint para finalizar el registro de un usuario corporativo con datos de Google.
   * @param {string} registrationToken - token temporal
   * @param {Partial<IUser>} userData - datos adicionales del formulario de registro corporativo.
   * @returns {Observable<IUser>} El usuario recién creado.
   */
  public completeGoogleCorporationSignup(registrationToken: string, userData: Partial<IUser>): Observable<IUser> {
    const payload = { registrationToken, userData };
    return this.http.post<IUser>('auth/google-signup/corporation', payload);
  }
}
