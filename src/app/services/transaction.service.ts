import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  ITransaction,
  ITransactionPayload,
} from "../interfaces/transaction.interface";
import { GlobalResponse } from "../interfaces/GlobalResponse.interface";

@Injectable({
  providedIn: "root",
})
export class TransactionService {
  private http: HttpClient = inject(HttpClient);
  private readonly baseUrl = "transactions";

  /**
   * Obtiene una lista paginada de transacciones (DTOs) del usuario actual.
   * @param page - El número de página (basado en 1).
   * @param size - El tamaño de la página.
   * @param sortField - Campo por el cual ordenar.
   * @param sortOrder - Orden de la clasificación (1 para ascendente, -1 para descendente).
   * @param filter - Filtro global para buscar transacciones.
   * @return Un Observable con la respuesta global que contiene las transacciones y la paginación.
   */
  getTransactions(
    page: number = 1,
    size: number = 10,
    sortField?: string,
    sortOrder?: number,
    filter?: string
  ): Observable<GlobalResponse<ITransaction[]>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    if (sortField && sortOrder) {
      params = params.set(
        "sort",
        `${sortField},${sortOrder === 1 ? "asc" : "desc"}`
      );
    }
    if (filter && filter.trim() !== "") {
      params = params.set("filter", filter);
    }

    return this.http.get<GlobalResponse<ITransaction[]>>(this.baseUrl, {
      params,
    });
  }

  /**
   * Crea una nueva transacción enviando un payload limpio.
   * @param transaction
   * @returns Un Observable con la transacción creada.
   */
  create(transaction: ITransactionPayload): Observable<ITransaction> {
    return this.http
      .post<GlobalResponse<ITransaction>>(this.baseUrl, transaction)
      .pipe(map((response) => response.data));
  }

  /**
   * Actualiza una transacción existente.
   * @param id - ID de la transacción a actualizar.
   * @param transaction - Payload de la transacción con los campos a actualizar.
   * @return Un Observable con la transacción actualizada.
   */
  update(
    id: number,
    transaction: ITransactionPayload
  ): Observable<ITransaction> {
    return this.http
      .put<GlobalResponse<ITransaction>>(`${this.baseUrl}/${id}`, transaction)
      .pipe(map((response) => response.data));
  }

  /**
   * Elimina una transacción.
   * @param id - ID de la transacción a eliminar.
   * @return Un Observable vacío que se completa al finalizar.
   */
  delete(id: number): Observable<void> {
    return this.http
      .delete<GlobalResponse<any>>(`${this.baseUrl}/${id}`)
      .pipe(map(() => undefined));
  }
}
