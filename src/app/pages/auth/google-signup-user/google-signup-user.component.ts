import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserFormComponent } from '../../../components/user/user-from/user-form.component';
import { CommonModule } from '@angular/common';

/**
 * @class GoogleUserSignupComponent
 * @description
 * Este componente controla el flujo para completar el registro de un usuario estándar.
 * Crea un FormGroup con los nombres de control estandarizados (`userName`, `userFirstSurename`, etc.)
 * que coinciden con la entidad del backend.
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

  /**
   * El FormGroup que define la estructura y validadores para el formulario.
   * Se pasa al componente hijo <app-user-form>.
   */
  public userForm!: FormGroup;

  /**
   * @method ngOnInit
   * @description
   * Al iniciar, valida el token de registro y crea el FormGroup con los datos
   * pre-rellenados de Google, usando los nombres de control correctos.
   */
  ngOnInit(): void {
    const registrationData = this.authService.getRegistrationData();
    if (!registrationData) {
      alert("Token de registro no encontrado o inválido.");
      this.router.navigate(['/login']);
      return;
    }

    this.userForm = this.fb.group({
      userEmail: [{ value: registrationData.email, disabled: true }],
      userName: [registrationData.given_name || '', Validators.required],
      userFirstSurename: [registrationData.family_name || '', Validators.required],
      userSecondSurename: [''],
      userGender: [''],
      userPhoneNumber: [''],
      id: [null]
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
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    const finalUserData = this.userForm.getRawValue();

    this.authService.completeGoogleUserSignup(registrationToken, finalUserData).subscribe({
      next: () => {
        alert("¡Registro completado exitosamente! Por favor, inicia sesión.");
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(`Error en el registro: ${err.error?.message || err.error}`);
      }
    });
  }
}
