import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface IPlotManagementRecord {
  id: number;
  plotId: number;
  cropId: number;
  cropName: string;
  actionName: string;
  actionPictureUrl: string;
  measureUnit: string;
  measureValue: number;
  valueSpent: number;
  actionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPlotManagementResponse {
  data: IPlotManagementRecord[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlotManagementService {
  /**
   * Delete a management record for a specific plot
   * @param plotId The ID of the plot
   * @param recordId The ID of the management record
   * @returns Observable for the delete operation
   */
  deletePlotManagementRecord(plotId: number, recordId: number): Observable<any> {
    return this.http.delete<any>(`plots/${plotId}/management-records/${recordId}`);
  }
  private http = inject(HttpClient);

  /**
   * Get management records for a specific plot
   * @param plotId The ID of the plot
   * @returns Observable with management records
   */
  getPlotManagementRecords(plotId: number): Observable<IPlotManagementResponse> {
    return this.http.get<IPlotManagementResponse>(`plots/${plotId}/management-records`);
  }

  /**
   * Get management records for a specific plot with pagination
   * @param plotId The ID of the plot
   * @param page Page number (default: 1)
   * @param limit Records per page (default: 10)
   * @returns Observable with management records
   */
  getPlotManagementRecordsPaginated(
    plotId: number, 
    page: number = 1, 
    limit: number = 10
  ): Observable<IPlotManagementResponse> {
    return this.http.get<IPlotManagementResponse>(
      `plots/${plotId}/management-records?page=${page}&limit=${limit}`
    );
  }
}
