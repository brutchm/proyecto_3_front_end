import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ICrop } from '../interfaces/crop.interface';
import { GlobalResponse } from '../interfaces/GlobalResponse.interface';


/**
 * @interface PaginatedCropResponse
 * Define la estructura de la respuesta paginada del backend para los cultivos.
 */
export interface PaginatedCropResponse {
  data: ICrop[];
  totalPages: number;
  totalElements: number;
  number: number; // El número de la página actual (basado en 0)
  size: number;
}

/**
 * @class CropService
 * @description
 * Servicio para gestionar las operaciones CRUD de los cultivos del usuario autenticado.
 * Toda la comunicación con la API de /api/crops se centraliza aquí.
 */
@Injectable({
  providedIn: 'root'
})
export class CropService {
  private http: HttpClient = inject(HttpClient);
  private readonly baseUrl = 'crops'; // URL base de la API de cultivos

  /**
   * Obtiene una lista paginada de cultivos para el usuario actual.
   * @param page - El número de página (basado en 0).
   * @param size - El tamaño de la página.
   * @returns Un Observable con la respuesta paginada.
   */
  getAllCrops(page: number = 1, size: number= 5): Observable<PaginatedCropResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedCropResponse>(this.baseUrl, { params });
  }

/**
   * Obtiene una lista paginada de los cultivos del usuario actual.
   * Apunta al nuevo endpoint específico /my-crops.
   * @param page - El número de página (basado en 1, como lo espera el backend).
   * @param size - El tamaño de la página.
   * @returns Un Observable con la respuesta global que contiene los cultivos y la paginación.
   */
  getCrops(page: number = 1, size: number = 5): Observable<GlobalResponse<ICrop[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<GlobalResponse<ICrop[]>>(`${this.baseUrl}/my-crops`, { params });
  }

  /**
   * Crea un nuevo cultivo.
   * @param crop - El objeto de cultivo a crear.
   * @returns Un Observable con el cultivo creado.
   */
  create(crop: Partial<ICrop>): Observable<ICrop> {
    return this.http.post<ICrop>(this.baseUrl, crop);
  }

  /**
   * Actualiza un cultivo existente.
   * @param id - El ID del cultivo a actualizar.
   * @param crop - El objeto de cultivo con los datos actualizados.
   * @returns Un Observable con el cultivo actualizado.
   */
  update(id: number, crop: Partial<ICrop>): Observable<ICrop> {
    return this.http.put<ICrop>(`${this.baseUrl}/${id}`, crop);
  }

  /**
   * Desactiva (borrado lógico) un cultivo.
   * @param id - El ID del cultivo a desactivar.
   * @returns Un Observable vacío que se completa al finalizar.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
