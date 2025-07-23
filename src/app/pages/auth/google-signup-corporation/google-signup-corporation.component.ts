import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { CorporationFormComponent } from '../../../components/user/corporation/corporation-form/corporation-form.component';
import { IUser } from '../../../interfaces';
import { splitFullName, toTitleCase } from '../../../utils/string.utils';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs';

/**
 * @class GoogleCorporationSignupComponent
 * @description
 * Este componente es responsable de:
 * - Validar el token de registro temporal de Google.
 * - Crear y pre-rellenar el FormGroup para los datos corporativos, omitiendo la contraseña.
 * - Contener y controlar el componente de formulario reutilizable `<app-corporation-form>`.
 * - Manejar el envío final de los datos al endpoint de registro de Google para corporaciones.
 */
@Component({
  selector: 'app-google-signup-corporation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CorporationFormComponent, ToastModule],
  templateUrl: './google-signup-corporation.component.html',
})
export class GoogleCorporationSignupComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);
  private messageService: MessageService = inject(MessageService);

  /**
   * El FormGroup que define la estructura y validadores para el formulario de registro
   * corporativo de Google. No incluye campos ni validadores de contraseña.
   */
  public corporationForm!: FormGroup;

  /**
   * @method ngOnInit
   * @description
   * Hook del ciclo de vida de Angular. Al iniciar el componente, obtiene el token de registro
   * de Google. Si es válido, se decodifica para obtener los datos del usuario y se inicializa
   * el formulario reactivo con estos datos y los campos requeridos para una corporación.
   */
  ngOnInit(): void {
    const registrationData = this.authService.getRegistrationData();
    if (!registrationData) {
      this.router.navigate(['/login']);
      return;
    }

    const lastNames = splitFullName(registrationData.family_name);

    this.corporationForm = this.fb.group({
      userEmail: [{ value: registrationData.email, disabled: true }],
      name: [toTitleCase(registrationData.given_name) || '', Validators.required],
      userFirstSurename: [lastNames.first, Validators.required],
      userSecondSurename: [lastNames.rest],

      businessName: ['', Validators.required],
      businessMission: ['', Validators.required],
      businessVision: ['', Validators.required],
      businessId: ['', Validators.required],
      businessCountry: ['Costa Rica', Validators.required],
      businessStateProvince: ['', Validators.required],
      businessOtherDirections: [''],
      businessLocation: [''],
      isActive: [true],
      id: [null]
    });
  }

  /**
   * @method handleFinalSignup
   * @description
   * Maneja el evento de guardado emitido por el componente hijo (`<app-corporation-form>`).
   * Valida el formulario y, si es válido, llama al servicio para completar el registro en el backend.
   */
  public handleFinalSignup(): void {
    const registrationToken = localStorage.getItem('registration_token');

    if (this.corporationForm.invalid) {
      this.corporationForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor, completa todos los campos requeridos.' });
      return;
    }

    if (!registrationToken) {
      this.messageService.add({ severity: 'error', summary: 'Error de Sesión', detail: 'El token de registro ha expirado. Por favor, inténtalo de nuevo.' });
      this.router.navigate(['/login']);
      return;
    }

    const finalUserData = this.corporationForm.getRawValue();

    this.authService.completeGoogleCorporationSignup(registrationToken, finalUserData).subscribe({
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
          detail: err.error.message || err.error || 'Ocurrió un error desconocido.'
        });
      }
    });
  }
}
