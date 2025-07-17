import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertService } from './alert.service';

export interface IFarmTechnicalInfo {
  id: number;
  soilPh: string;
  soilNutrients: string;
  irrigationSystem: boolean;
  irrigationSystemType: string;
  waterAvailable: boolean;
  waterUsageType: string;
  fertilizerPesticideUse: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  isActive: boolean | null;
}

export interface IFarm {
  id: number;
  farmName: string;
  farmCountry: string;
  farmStateProvince: string;
  farmOtherDirections: string;
  farmLocation: string;
  farmSize: number;
  farmMeasureUnit: string;
  createdAt: string | null;
  updatedAt: string | null;
  technicalInformation: IFarmTechnicalInfo;
  active: boolean;
}

export interface IMyFarmResponse {
  message: string;
  data: Array<{
    technicalInfo: IFarmTechnicalInfo;
    farm: IFarm;
  }>;
  meta: {
    method: string;
    url: string;
    totalPages: number;
    totalElements: number;
    pageNumber: number;
    pageSize: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private http = inject(HttpClient);
  private alertService: AlertService = inject(AlertService);
  private myFarmsSignal = signal<IMyFarmResponse | null>(null);

  get myFarms$() {
    return this.myFarmsSignal;
  }

  getMyFarms() {
    return this.http.get<IMyFarmResponse>('farms/my-farms');
  }

  farmById(id: string | number) {
    return this.http.get<{ message: string; data: { technicalInfo: IFarmTechnicalInfo; farm: IFarm }; meta: any }>(`farms/${id}`);
  }

  removeFarm(id: string | number) {
    return this.http.delete<{ message: string }>(`farms/${id}`);
  }
}
