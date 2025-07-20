import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IUser } from '../../../interfaces';
import { timer } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

/**
 * @fileoverview Validador personalizado para asegurar que la contraseña y su confirmación coincidan.
 */
export const passwordMatchValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const password = form.get('userPassword')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

/**
 * @fileoverview Validador personalizado para la fortaleza de la contraseña.
 */
function securePasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  // Expresión regular para 8+ caracteres, con al menos una mayúscula, una minúscula, un número y un símbolo.
  const securePasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return securePasswordRegex.test(value)
    ? null
    : { insecurePassword: true };
}

/**
 * @class SignUpComponent
 * @description
 * Componente para el registro de un nuevo usuario estándar (Administrador de Finca)
 * utilizando un formulario reactivo para una validación y manejo robusto.
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignUpComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  private messageService: MessageService = inject(MessageService);
  public signupForm!: FormGroup;

  ngOnInit(): void {
    // Se estandariza el nombre del control a 'userName' para que coincida con la entidad del backend.
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      userFirstSurename: ['', Validators.required],
      userSecondSurename: [''],
      userGender: [''],
      userPhoneNumber: [''],
      userEmail: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, securePasswordValidator]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  /**
   * @method handleSignup
   * @description
   * Procesa el envío del formulario. Si el formulario es válido, construye explícitamente el
   * objeto de usuario y lo envía al servicio de autenticación para registrarlo.
   */
  public handleSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const formValue = this.signupForm.getRawValue();
    const userData: IUser = {
      name: formValue.name,
      userFirstSurename: formValue.userFirstSurename,
      userSecondSurename: formValue.userSecondSurename,
      userGender: formValue.userGender,
      userPhoneNumber: formValue.userPhoneNumber,
      userEmail: formValue.userEmail,
      userPassword: formValue.userPassword,
    };

    this.authService.signup(userData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: '¡Registro Exitoso!',
          detail: 'Tu cuenta ha sido creada. Redirigiendo a login...'
        });

        // Redirección automática después de 3 segundos
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
