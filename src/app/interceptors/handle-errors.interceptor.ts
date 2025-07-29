import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const handleErrorsInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);

  return next(req).pipe(
    catchError((error: any): Observable<any> => {
      if (error instanceof HttpErrorResponse) {
        if ((error.status === 401 || error.status === 403) && !req.url.includes('auth')) {
          const message = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
          authService.logout(message);
          
          return of(); 
        }
      
        if (error.status === 422) {
          throw error.error;
        }
        if (error.status === 404) {
          throw { status: false };
        }
      }

        return throwError(() => error);
    })
  );
};
