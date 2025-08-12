import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GlobalResponse } from '../interfaces/GlobalResponse.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http: HttpClient = inject(HttpClient);
  private readonly baseUrl = 'dashboard/reports';

  /**
   * Genera un reporte enviando la configuración al backend.
   * El tipo de retorno es 'any' porque diferentes reportes tendrán diferentes estructuras.
   */
  generateReport(reportConfig: any): Observable<any> {
    return this.http.post<GlobalResponse<any>>(this.baseUrl, reportConfig)
      .pipe(map(response => response.data));
  }
}