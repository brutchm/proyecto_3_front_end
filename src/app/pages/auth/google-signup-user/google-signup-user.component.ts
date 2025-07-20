import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserFormComponent } from '../../../components/user/user-from/user-form.component';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';
import { splitFullName, toTitleCase } from '../../../utils/string.utils';

/**
 * @fileoverview Componente "inteligente" para la página de finalización de registro de un usuario estándar
 * (Administrador de Fincas) que ha iniciado el proceso a través de Google.
 * @version 3.0.0
 * @author Tu Nombre
 */

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
  imports: [CommonModule, ReactiveFormsModule, UserFormComponent],
  templateUrl: './google-signup-user.component.html',
})
export class GoogleUserSignupComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  public userForm!: FormGroup;
  public successMessage?: string;
  public errorMessage?: string;

  /**
   * @method ngOnInit
   * @description
   * Al iniciar, valida el token de registro y crea el FormGroup con los datos
   * pre-rellenados de Google, usando los nombres de control correctos.
   */
  ngOnInit(): void {
    const registrationData = this.authService.getRegistrationData();
    if (!registrationData) {
      // TODO: Reemplazar 'alert' con un servicio de notificaciones.
      alert("Token de registro no encontrado o inválido.");
      this.router.navigate(['/login']);
      return;
    }

    console.log("Datos de registro obtenidos:", registrationData);
    // Se utiliza la nueva utilidad para dividir los apellidos.
    const lastNames = splitFullName(registrationData.family_name);

    this.userForm = this.fb.group({
      // Los nombres de control coinciden con el `formControlName` del HTML hijo.
      userEmail: [{ value: registrationData.email, disabled: true }],
      userName: [toTitleCase(registrationData.given_name) || '', Validators.required],
      userFirstSurename: [lastNames.first, Validators.required],
      userSecondSurename: [lastNames.rest],
      userGender: [registrationData.exp],
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
    const registrationToken = localStorage.getItem('registration_token');
    if (this.userForm.invalid || !registrationToken) {
      this.userForm.markAllAsTouched();
      this.errorMessage = "Por favor, completa todos los campos requeridos.";
      return;
    }

    const finalUserData = this.userForm.getRawValue();

    this.authService.completeGoogleUserSignup(registrationToken, finalUserData).subscribe({
      next: () => {
        this.successMessage = "¡Registro completado exitosamente! Redirigiendo a login en 3 segundos...";
        timer(3000).subscribe(() => this.router.navigate(['/login']));
        this.authService.logout();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error || 'Ocurrió un error desconocido.';
      }
    });
  }
}
