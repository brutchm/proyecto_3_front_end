import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GlobalResponse } from '../interfaces/GlobalResponse.interface';
import { IDashboardSummary } from '../interfaces/dashboard.interface';
import { IChartData, ICropYieldChartData, IDoughnutChartData } from '../interfaces/chart.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http: HttpClient = inject(HttpClient);
  private readonly baseUrl = 'dashboard';

  getSummary(): Observable<IDashboardSummary> {
    return this.http.get<GlobalResponse<IDashboardSummary>>(`${this.baseUrl}/summary`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtiene los datos para el gráfico de ingresos vs. egresos diarios.
   * @returns Un Observable con los datos del gráfico.
   */
  getDailyChartData(): Observable<IChartData> {
    return this.http.get<GlobalResponse<IChartData>>(`${this.baseUrl}/daily-chart`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtém os dados para o gráfico circular do mês atual.
   */
  getCurrentMonthChartData(): Observable<IDoughnutChartData> {
    return this.http.get<GlobalResponse<IDoughnutChartData>>(`${this.baseUrl}/monthly-chart`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtiene los datos para el gráfico de rendimiento de cultivos.
   */
  getTopCropYieldData(): Observable<ICropYieldChartData> {
    // El backend devuelve un array de {cropName, totalQuantity}.
    // Lo transformamos a la estructura que necesita nuestro gráfico.
    return this.http.get<GlobalResponse<{cropName: string, totalQuantity: number}[]>>(`${this.baseUrl}/crop-yield`)
      .pipe(
        map(response => {
          const labels = response.data.map(item => item.cropName);
          const data = response.data.map(item => item.totalQuantity);
          return { labels, data };
        })
      );
  }
}
