import {
  Component,
  ElementRef,
  inject,
  ViewChild,
} from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { ModalService } from "../../../services/modal.service";
import { ModalComponent } from "../../../components/modal/modal.component";
import { environment } from '../../../../environments/environment';
import { validateEmail } from '../../../utils/emailValidator.utils'
import { RouterModule } from '@angular/router';
@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent,RouterModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  clearErrors(): void {
    this.loginError = "";
    this.resetError = "";
    this.resetSuccess = "";
    this.confirmPasswordError = "";
  }
  public loginError!: string;
  public loading = false;
  public submitted = false;
  public currentForm: "login" | "request-reset" | "reset" = "login";

  @ViewChild("email")
  emailModel!: NgModel;
  @ViewChild("password")
  passwordModel!: NgModel;
  @ViewChild('resetEmail')
  resetEmailModel!: NgModel;
  @ViewChild('requestResetEmail')
  requestResetEmailModel!: NgModel;
  public modalService: ModalService = inject(ModalService);
  @ViewChild("emptyFieldsModal")
  emptyFieldsModal!: ElementRef;

  public loginForm = {
    userEmail: "",
    userPassword: "",
  };

  public requestResetForm = {
    email: ""
  };

  public resetForm = {
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  };
  public resetSuccess: string = "";
  public resetError: string = "";
  public confirmPasswordError: string = "";

  public showLoginPassword: boolean = false;
  public showResetPassword: boolean = false;
  public showConfirmPassword: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  public onEmailChange(email: string): void {
    this.loginError = "";
    this.resetError = "";
    this.resetSuccess = "";
    this.confirmPasswordError = "";
    let model: NgModel | undefined;
    if (this.currentForm === 'login') {
      model = this.emailModel;
    } else if (this.currentForm === 'reset') {
      model = this.resetEmailModel;
    } else if (this.currentForm === 'request-reset') {
      model = this.requestResetEmailModel;
    }
    if (!model) return;
    const isEmailValid = validateEmail(model.value);
    if (!isEmailValid || !model.valid) {
      model.control.setErrors({ invalidEmail: true });
    }
  }

  public onPasswordChange(): void {
    this.resetError = "";
    this.resetSuccess = "";
    this.confirmPasswordError = "";
  }

  public handleLogin(event: Event): void {
    event.preventDefault();
    this.clearErrors();
    this.submitted = true;

    // Trim input values
    this.loginForm.userEmail = this.loginForm.userEmail.trim();
    this.loginForm.userPassword = this.loginForm.userPassword.trim();

    // Marcar campos como tocados
    this.emailModel.control.markAsTouched();
    this.passwordModel.control.markAsTouched();

    const isEmailValid = validateEmail(this.emailModel.value);
    // Si algún campo no es válido, mostrar el modal
    if (!isEmailValid || !this.emailModel.valid || !this.passwordModel.valid) {
      this.modalService.displayModal("md", this.emptyFieldsModal);
      return;
    }
    this.loading = true;
    this.authService.login(this.loginForm).subscribe({
      next: (data) => {
        this.loading = false;
        // this.router.navigateByUrl("/app/dashboard");
        const homeUrl = this.authService.getHomeUrlForUser();
        this.router.navigateByUrl(homeUrl);
      },
      error: (err) => {
        this.loading = false;
        this.loginError = err?.error?.description || "Error al iniciar sesión.";
      },
    });
  }

  public handleRequestResetPassword(event: Event): void {
    event.preventDefault();
    this.clearErrors();
    this.submitted = true;
    this.requestResetForm.email = this.requestResetForm.email.trim();
    const isEmailValid = validateEmail(this.requestResetForm.email);
    if (!isEmailValid) {
      this.loginError = "Por favor ingrese un correo válido.";
      this.resetSuccess = "";
      return;
    }
    this.loading = true;
    this.authService.resetPasswordRequest(this.requestResetForm.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.loginError = "";
        this.resetSuccess = "Correo de recuperación enviado.";
        setTimeout(() => {
          this.switchToReset();
        }, 1500);
      },
      error: (err: any) => {
        this.loading = false;
        this.resetSuccess = "";
        this.loginError = err?.error?.description || "Error al enviar correo de recuperación.";
      },
    });
  }

  public handleResetPassword(event: Event): void {
    event.preventDefault();
    this.clearErrors();
    this.submitted = true;

    this.resetForm.email = this.resetForm.email.trim();
    this.resetForm.code = this.resetForm.code.trim();
    this.resetForm.newPassword = this.resetForm.newPassword.trim();
    this.resetForm.confirmPassword = this.resetForm.confirmPassword.trim();

    const isEmailValid = validateEmail(this.resetForm.email);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    const isPasswordValid = passwordRegex.test(this.resetForm.newPassword);
    const isCodeValid = /^[a-zA-Z0-9]{6}$/.test(this.resetForm.code);
    const passwordsMatch = this.resetForm.newPassword === this.resetForm.confirmPassword;

    if (!isEmailValid) {
      this.resetError = "Por favor ingrese un correo válido.";
      this.resetSuccess = "";
      this.confirmPasswordError = "";
      return;
    }
    if (!isPasswordValid) {
      this.resetError = "La nueva contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial.";
      this.resetSuccess = "";
      this.confirmPasswordError = "";
      return;
    }
    if (!isCodeValid) {
      this.resetError = "El código debe tener 6 caracteres alfanuméricos.";
      this.resetSuccess = "";
      this.confirmPasswordError = "";
      return;
    }
    if (!passwordsMatch) {
      this.confirmPasswordError = "Las contraseñas no coinciden.";
      this.resetError = "";
      this.resetSuccess = "";
      return;
    } else {
      this.confirmPasswordError = "";
    }

    this.loading = true;
    this.authService.resetPassword(this.resetForm).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.resetError = "";
        this.resetSuccess = "Contraseña restablecida correctamente.";
      },
      error: (err: any) => {
        this.loading = false;
        this.resetSuccess = "";
        this.resetError = err?.error?.description || "Error al restablecer la contraseña.";
      },
    });
  }

  public switchToRequestReset(): void {
    this.currentForm = "request-reset";
    this.requestResetForm.email = "";
    this.resetForm = { email: "", code: "", newPassword: "", confirmPassword: "" };
    this.loginError = "";
    this.resetError = "";
    this.resetSuccess = "";
    this.confirmPasswordError = "";
  }

  public switchToReset(): void {
    this.currentForm = "reset";
    this.resetForm.email = this.requestResetForm.email;
    this.resetForm.code = "";
    this.resetForm.newPassword = "";
    this.resetForm.confirmPassword = "";
    this.loginError = "";
    this.resetError = "";
    this.resetSuccess = "";
    this.confirmPasswordError = "";
  }

  public switchToLogin(): void {
    this.currentForm = "login";
    this.loginForm = { userEmail: "", userPassword: "" };
    this.requestResetForm.email = "";
    this.resetForm = { email: "", code: "", newPassword: "", confirmPassword: "" };
    this.loginError = "";
    this.resetError = "";
    this.resetSuccess = "";
    this.confirmPasswordError = "";
  }

  public toggleLoginPassword(): void {
    this.showLoginPassword = !this.showLoginPassword;
  }
  public toggleResetPassword(): void {
    this.showResetPassword = !this.showResetPassword;
  }
  public toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Construye la URL de autenticación de Google y redirige al usuario.
   * Los parámetros se configuran según la documentación de OAuth 2.0.
   */
  public handleGoogleLogin(): void {
    const GOOGLE_CLIENT_ID = environment.googleClientId;
    const REDIRECT_URI = environment.googleRedirectUri;

    const params = {
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    };

    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams(params);

    // Redirigir al usuario a la página de consentimiento de Google
    window.location.href = authUrl;
  }
}
