import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

/**
 * @class AuthCallbackComponent
 * @description
 * Captura el código de autorización de la URL, lo envía al backend para
 * su validación y redirige al usuario según la respuesta del servidor
 * (al dashboard si es un login exitoso, o al flujo de finalización de registro).
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-callback.component.html',
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 80vh;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  /**
   * @method ngOnInit
   * @description
   * Al iniciar, extrae los parámetros 'code' o 'error' de la URL.
   * Inicia el proceso de validación del código con el backend.
   */
  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      alert('Autenticación denegada en Google. No se concedieron los permisos necesarios.');
      this.router.navigate(['/login']);
      return;
    }

    if (code) {
      this.authService.handleGoogleCallback(code).subscribe({
        next: (response) => {
          if (response.status === 'LOGIN_SUCCESS' && response.authUser) {
            this.authService.storeSession(response.token, response.authUser);
            // this.router.navigateByUrl('/app/dashboard');
            const homeUrl = this.authService.getHomeUrlForUser();
            this.router.navigateByUrl(homeUrl);
          } else if (response.status === 'REGISTRATION_REQUIRED') {
            localStorage.setItem('registration_token', response.token);
            this.router.navigate(['/auth/finish-registration']);
          }
        },
        error: (err) => {
          alert(`Error de autenticación: ${err.error?.error || 'Error del servidor'}`);
          this.router.navigate(['/login']);
        }
      });
    } else {
      // Si no hay código ni error, es una ruta inválida.
      this.router.navigate(['/login']);
    }
  }
}
