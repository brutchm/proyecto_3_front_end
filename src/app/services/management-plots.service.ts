import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ManagementPlotPayload {
  cropId: string;
  actionName: string;
  actionPictureUrl: string;
  measureUnit: string;
  measureValue: number;
  valueSpent: number;
  actionDate: string;
}

@Injectable({ providedIn: 'root' })
export class ManagementPlotsService {
  /**
   * Update a management record for a specific plot
   */
  update(plotId: string | number, gestionId: string | number, payload: ManagementPlotPayload): Observable<any> {
    return this.http.put(`plots/${plotId}/management-records/${gestionId}`, payload);
  }
  private http = inject(HttpClient);

  constructor() {}

  create(plotId: string, payload: ManagementPlotPayload): Observable<any> {
    return this.http.post(`plots/${plotId}/management-records`, payload);
  }

  /**
   * Get all management records for all crops (all plots)
   */
  getAllManagementRecords(): Observable<any> {
    return this.http.get('plots/management-records');
  }
}
