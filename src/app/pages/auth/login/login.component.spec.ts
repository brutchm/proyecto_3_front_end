
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { of, throwError } from 'rxjs';

class MockAuthService {
  login() { return { subscribe: (handlers: any) => handlers.next({}) }; }
  resetPasswordRequest() { return { subscribe: (handlers: any) => handlers.next({}) }; }
  resetPassword() { return { subscribe: (handlers: any) => handlers.next({}) }; }
  getHomeUrlForUser() { return '/app/dashboard'; } 
}
class MockModalService {
  displayModal() {}
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent, // Standalone component must be imported here
        FormsModule,
        CommonModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: ModalService, useClass: MockModalService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial form states', () => {
    expect(component.loginForm.userEmail).toBe('');
    expect(component.loginForm.userPassword).toBe('');
    expect(component.currentForm).toBe('login');
  });

  it('should clear errors', () => {
    component.loginError = 'error';
    component.resetError = 'error';
    component.resetSuccess = 'success';
    component.confirmPasswordError = 'error';
    component.clearErrors();
    expect(component.loginError).toBe('');
    expect(component.resetError).toBe('');
    expect(component.resetSuccess).toBe('');
    expect(component.confirmPasswordError).toBe('');
  });

  it('should switch forms', () => {
    component.switchToRequestReset();
    expect(component.currentForm).toBe('request-reset');
    component.switchToReset();
    expect(component.currentForm).toBe('reset');
    component.switchToLogin();
    expect(component.currentForm).toBe('login');
  });


  it('should call AuthService.login on handleLogin', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'login').and.callThrough();
    component.loginForm.userEmail = 'test@example.com';
    component.loginForm.userPassword = 'password123';
    // Simulate valid NgModel
    component.emailModel = { value: 'test@example.com', valid: true, control: { markAsTouched: () => {}, setErrors: () => {} } } as any;
    component.passwordModel = { value: 'password123', valid: true, control: { markAsTouched: () => {} } } as any;
    const event = { preventDefault: () => {} } as Event;
    spyOn(event, 'preventDefault');
    component.handleLogin(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(authService.login).toHaveBeenCalled();
  });

  it('should set loginError on failed login', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'login').and.returnValue(throwError(() => ({ error: { description: 'Login failed' } })));
    component.loginForm.userEmail = 'test@example.com';
    component.loginForm.userPassword = 'password123';
    component.emailModel = { value: 'test@example.com', valid: true, control: { markAsTouched: () => {}, setErrors: () => {} } } as any;
    component.passwordModel = { value: 'password123', valid: true, control: { markAsTouched: () => {} } } as any;
    const event = { preventDefault: () => {} } as Event;
    component.handleLogin(event);
    expect(component.loginError).toBe('Login failed');
  });

  it('should call AuthService.resetPasswordRequest on handleRequestResetPassword', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'resetPasswordRequest').and.callThrough();
    component.requestResetForm.email = 'test@example.com';
    const event = { preventDefault: () => {} } as Event;
    component.handleRequestResetPassword(event);
    expect(authService.resetPasswordRequest).toHaveBeenCalledWith('test@example.com');
  });

  it('should set resetSuccess on successful password reset request', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'resetPasswordRequest').and.returnValue(of({}));
    component.requestResetForm.email = 'test@example.com';
    const event = { preventDefault: () => {} } as Event;
    component.handleRequestResetPassword(event);
    expect(component.resetSuccess).toBe('Correo de recuperación enviado.');
  });

  it('should set loginError on failed password reset request', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'resetPasswordRequest').and.returnValue(throwError(() => ({ error: { description: 'Reset failed' } })));
    component.requestResetForm.email = 'test@example.com';
    const event = { preventDefault: () => {} } as Event;
    component.handleRequestResetPassword(event);
    expect(component.loginError).toBe('Reset failed');
  });

  it('should call AuthService.resetPassword on handleResetPassword', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'resetPassword').and.callThrough();
    component.resetForm = {
      email: 'test@example.com',
      code: 'ABC123',
      newPassword: 'Password1!',
      confirmPassword: 'Password1!'
    };
    const event = { preventDefault: () => {} } as Event;
    component.handleResetPassword(event);
    expect(authService.resetPassword).toHaveBeenCalled();
  });

  it('should set resetSuccess on successful password reset', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'resetPassword').and.returnValue(of({}));
    component.resetForm = {
      email: 'test@example.com',
      code: 'ABC123',
      newPassword: 'Password1!',
      confirmPassword: 'Password1!'
    };
    const event = { preventDefault: () => {} } as Event;
    component.handleResetPassword(event);
    expect(component.resetSuccess).toBe('Contraseña restablecida correctamente.');
  });

  it('should set resetError on failed password reset', () => {
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'resetPassword').and.returnValue(throwError(() => ({ error: { description: 'Reset error' } })));
    component.resetForm = {
      email: 'test@example.com',
      code: 'ABC123',
      newPassword: 'Password1!',
      confirmPassword: 'Password1!'
    };
    const event = { preventDefault: () => {} } as Event;
    component.handleResetPassword(event);
    expect(component.resetError).toBe('Reset error');
  });

});
