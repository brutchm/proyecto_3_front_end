import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserFormComponent } from '../../../components/user/user-form/user-form.component';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';
import { splitFullName, toTitleCase } from '../../../utils/string.utils';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

/**
 * @class GoogleUserSignupComponent
 * @description
 * Este componente controla el flujo para completar el registro de un usuario estándar.
 * Crea un FormGroup con los nombres de control estandarizados (`userName`, `userFirstSurename`, etc.)
 * que coinciden con la entidad del backend y lo pasa al formulario reutilizable.
 */
@Component({
  selector: 'app-google-signup-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserFormComponent, ToastModule],
  templateUrl: './google-signup-user.component.html',
  // providers: [MessageService]
})
export class GoogleUserSignupComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  public userForm!: FormGroup;
  private messageService: MessageService = inject(MessageService);


  /**
   * @method ngOnInit
   * @description
   * Al iniciar, valida el token de registro y crea el FormGroup con los datos
   * pre-rellenados de Google, usando los nombres de control correctos.
   */
  ngOnInit(): void {
    const registrationData = this.authService.getRegistrationData();
    if (!registrationData) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Token de registro no encontrado o inválido.' });
      this.router.navigate(['/login']);
      return;
    }

    const lastNames = splitFullName(registrationData.family_name);

    this.userForm = this.fb.group({
      userEmail: [{ value: registrationData.email, disabled: true }],
      name: [toTitleCase(registrationData.given_name) || '', Validators.required],
      userFirstSurename: [lastNames.first, Validators.required],
      userSecondSurename: [lastNames.rest],
      userGender: [''],
      userPhoneNumber: [''],
      id: [null]
      // No se incluyen los campos de contraseña.
    });
  }

  /**
   * @method handleFinalSignup
   * @description
   * Maneja el envío final del formulario, leyendo los datos directamente
   * del FormGroup del padre para mayor robustez.
   */
  public handleFinalSignup(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, completa todos los campos requeridos.' });
      return;
    }

    const registrationToken = localStorage.getItem('registration_token');
    if (!registrationToken) {
      this.messageService.add({ severity: 'error', summary: 'Error de Sesión', detail: 'El token de registro ha expirado. Por favor, inténtalo de nuevo.' });
      this.router.navigate(['/login']);
      return;
    }

    const finalUserData = this.userForm.getRawValue();

    this.authService.completeGoogleUserSignup(registrationToken, finalUserData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: '¡Registro Exitoso!',
          detail: 'Tu cuenta ha sido creada. Redirigiendo a login...'
        });

        timer(3000).subscribe(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error en el Registro',
          detail: err.error?.message || err.error || 'Ocurrió un error desconocido.'
        });
      }
    });
  }
}
