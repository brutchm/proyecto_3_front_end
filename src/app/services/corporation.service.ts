import { inject, Injectable, signal } from "@angular/core";
import { IResponse, ISearch } from "../interfaces";
import { AlertService } from "./alert.service";
import { BaseService } from "./base-service";
import { ICorporation } from "../interfaces/corporation.interface";
import { Router } from "@angular/router";
import { catchError, Observable, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CorporationService extends BaseService<ICorporation> {
  protected override source: string = "auth/signup/corporation";
  private corporationListSignal = signal<ICorporation[]>([]);
  get corporation$() {
    return this.corporationListSignal;
  }
  public search: ISearch = {
    page: 1,
    size: 5,
  };

  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  private router = inject(Router);
  // save(item: ICorporation): Observable<IResponse<ICorporation>> {
  //   return this.add(item).pipe(
  //     tap((response) => {
  //       this.alertService.displayAlert(
  //         "success",
  //         response.message,
  //         "center",
  //         "top",
  //         ["success-snackbar"]
  //       );
  //       setTimeout(() => {
  //         this.router.navigate(["/login"]);
  //       }, 2000);
  //     }),
  //     catchError((err) => {
  //       alert("Error al registrar la corporación");
  //       const backendMessage =
  //         err?.error?.message ||
  //         "Ocurrió un error al registrarse como usuario corporativo";
  //       this.alertService.displayAlert(
  //         "error",
  //         backendMessage,
  //         "center",
  //         "top",
  //         ["error-snackbar"]
  //       );
  //       console.error("Error del backend:", err);
  //       throw err;
  //     })
  //   );
  // }
  save(item: ICorporation): Observable<IResponse<ICorporation>> {
    return this.add(item);
  }

  update(item: ICorporation) {
    this.edit(item.id, item).subscribe({
      next: (response: IResponse<ICorporation>) => {
        this.alertService.displayAlert(
          "success",
          response.message,
          "center",
          "top",
          ["success-snackbar"]
        );
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al actualizar los datos del usuario corporativo",
          "center",
          "top",
          ["error-snackbar"]
        );
        console.error("error", err);
      },
    });
  }

  delete(item: ICorporation) {
    this.del(item.id).subscribe({
      next: (response: IResponse<ICorporation>) => {
        this.alertService.displayAlert(
          "success",
          response.message,
          "center",
          "top",
          ["success-snackbar"]
        );
      },
      error: (err: any) => {
        this.alertService.displayAlert(
          "error",
          "Ocurrió un error al intentar eliminar el usuario corporativo",
          "center",
          "top",
          ["error-snackbar"]
        );
        console.error("error", err);
      },
    });
  }
}
