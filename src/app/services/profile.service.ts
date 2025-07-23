import { Injectable, inject, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IResponse, IUser } from '../interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseService<IUser> {
  protected override source: string = 'users/me';
  private userSignal = signal<IUser>({});
  private snackBar = inject(MatSnackBar);
  private profileSubject = new BehaviorSubject<IUser[]>([]);
  public profile$ = this.profileSubject.asObservable();
  private alertService: AlertService = inject(AlertService);

  get user$() {
    return  this.userSignal;
  }

  getUserInfoSignal() {
    this.findAll().subscribe({
      next: (response: any) => {
        this.userSignal.set(response);
        
      },
      error: (error: any) => {
        this.snackBar.open(
          `Ha ocurrido un error al obtener la información del perfil ${error.message}`,
           'Close', 
          {
            horizontalPosition: 'right', 
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          }
        )
      }
    })
  }

     

}
