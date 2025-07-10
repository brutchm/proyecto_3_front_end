import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { IUser } from '../../../interfaces';
import { timer } from 'rxjs';

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
  const securePasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return securePasswordRegex.test(value)
    ? null
    : { insecurePassword: true };
}

/**
 * @class SigUpComponent
 * @description
 * Componente para el registro de un nuevo usuario estándar (Administrador de Finca)
 * utilizando un formulario reactivo para una validación y manejo robusto.
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SigUpComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  public signupForm!: FormGroup;
  public signUpError?: string;
  public validSignup: boolean = false;
  public successMessage?: string;

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      userFirstSurename: ['', Validators.required],
      userSecondSurename: [''],
      userGender: [''],
      userPhoneNumber: [''],
      userEmail: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, securePasswordValidator]],
      confirmPassword: ['', Validators.required],
      isActive: [true],
    }, { validators: passwordMatchValidator });
  }

  /**
   * @method handleSignup
   * @description
   * Procesa el envío del formulario. Si el formulario es válido, envía los datos
   * al servicio de autenticación para registrar al nuevo usuario.
   */
  public handleSignup(): void {
    this.signUpError = undefined;
    this.validSignup = false;
    this.successMessage = undefined;

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const userData: IUser = this.signupForm.value;

    this.authService.signup(userData).subscribe({
      next: () => {
        this.successMessage = "¡Usuario registrado exitosamente! Redirigiendo a login en 3 segundos...";
        this.signupForm.reset();

        // Redirección automática a login después de 3 segundos.
        timer(3000).subscribe(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.signUpError = err.error || 'Ocurrió un error desconocido.';
      },
    });
  }
}
