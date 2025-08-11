import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ICrop } from '../interfaces/crop.interface';
import { IPriceMarket, IResponse } from '../interfaces';
import { BaseService } from './base-service';

export interface GlobalResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
  [key: string]: any;
}
export interface MetaInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  [key: string]: any;
}

export interface PaginatedCropResponse {
  data: ICrop[];
  meta: MetaInfo;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CropPriceMarketListService {
  private http: HttpClient = inject(HttpClient);
  private readonly baseUrl = 'crops/list-price-crops';

  getAllCrops(page: number = 1, size: number= 20): Observable<PaginatedCropResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedCropResponse>(this.baseUrl, { params });
  }

}

@Injectable({
  providedIn: 'root'
})
export class PriceMarketService extends BaseService<IPriceMarket>{
  protected override source: string = 'market-prices';
//upsert para registrar o actualizar precios
  save(item: IPriceMarket): Observable<IResponse<IPriceMarket>> {
    return this.add(item);
  }
//Listar mis precios registrados
  getMyPrices(page: number = 1, size: number = 10): Observable<GlobalResponse<IPriceMarket[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<GlobalResponse<IPriceMarket[]>>('market-prices/my-prices', { params });
  }
  //Eliminar precios
  deletePrice(id: number): Observable<void> {
    return this.http.delete<void>(`market-prices/${id}`);
  }
  
}
