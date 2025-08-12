import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";


export interface IParcela {
  id?: number;
  plotName: string;
  plotDescription: string;
  plotType: string;
  currentUsage: string;
  geometryPolygon: string | null;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  active?: boolean;
}

export interface IParcelasResponse {
  message: string;
  data: IParcela[];
  meta: any;
}

@Injectable({
  providedIn: "root",
})
export class ParcelasService {
  updateParcela(farmId: string | number, parcelaId: string | number, parcela: IParcela): Observable<{ message: string; data: IParcela }> {
    // Send the entire parcela object in the request body
    return this.http.put<{ message: string; data: IParcela }>(
      `farms/${farmId}/plots/${parcelaId}`,
      parcela
    );
  }
  private http = inject(HttpClient);

  createParcela(farmId: string | number, parcela: IParcela): Observable<{ message: string; data: IParcela }> {
    return this.http.post<{ message: string; data: IParcela }>(
      `farms/${farmId}/plots`,
      parcela
    );
  }

  getParcelas(farmId: string | number): Observable<IParcelasResponse> {
    return this.http.get<IParcelasResponse>(`farms/${farmId}/plots`);
  }

  eliminarParcela(farmId: string | number, parcelaId: string | number): Observable<any> {
    return this.http.delete<any>(`farms/${farmId}/plots/${parcelaId}`);
  }
}
