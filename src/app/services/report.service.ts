import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GlobalResponse } from '../interfaces/GlobalResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http: HttpClient = inject(HttpClient);
  private readonly baseUrl = 'dashboard/reports'; // Apunta al endpoint de reportes

  /**
   * Genera un reporte enviando la configuración al backend.
   * @param reportConfig - El objeto con el tipo de reporte y los filtros.
   * @returns Un Observable con los datos del reporte.
   */
//   generateReport(reportConfig: any): Observable<IIncomeVsExpensesData> {
//     return this.http.post<GlobalResponse<IIncomeVsExpensesData>>(this.baseUrl, reportConfig)
//       .pipe(map(response => response.data));
//   }

  /**
   * Genera un reporte enviando la configuración al backend.
   * El tipo de retorno es 'any' porque diferentes reportes tendrán diferentes estructuras.
   */
  generateReport(reportConfig: any): Observable<any> {
    return this.http.post<GlobalResponse<any>>(this.baseUrl, reportConfig)
      .pipe(map(response => response.data));
  }
}