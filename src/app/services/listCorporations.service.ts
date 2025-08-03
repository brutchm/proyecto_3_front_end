import { inject, Injectable, signal } from '@angular/core';
import { IResponse, ISearch} from '../interfaces';
import { BaseService } from './base-service';
import { ICorporation } from '../interfaces/corporation.interface';

@Injectable({
    providedIn: 'root'
  })

  export class ListCorporationService  extends BaseService<ICorporation>{
    protected override source: string = 'users/listcorporations';
    public listCorporationSignal = signal<ICorporation[]>([]);
    get listCorporation$() {
      return this.listCorporationSignal;
    }
    public search: ISearch = { 
      page: 1,
      size: 8
    }
  
    public totalItems: any = [];
    
    getAll () {
      this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
        next: (response: IResponse<ICorporation[]>) => {
          this.search = { ...this.search, ...response.meta };
          this.totalItems = Array.from({ length: this.search.totalPages ? this.search.totalPages : 0 }, (_, i) => i + 1);
          this.listCorporationSignal.set(response.data);
        },
        error: (err: any) => {
          console.error('error', err);
        }
      });
    }

  
  }