import { inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AlertService } from "./alert.service";
import { Observable } from "rxjs";

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
  active: boolean;
}

export interface IFarmResponse {
  technicalInfo: IFarmTechnicalInfo;
  farm: IFarm;
}

export interface IPaginatedFarmsResponse {
  message: string;
  data: IFarmResponse[];
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
  providedIn: "root",
})
export class FarmService {
  private http = inject(HttpClient);
  private alertService: AlertService = inject(AlertService);
  private myFarmsSignal = signal<IPaginatedFarmsResponse | null>(null);

  get myFarms$() {
    return this.myFarmsSignal;
  }

  createFarm(farm: Partial<IFarm>, technicalInfo: Partial<IFarmTechnicalInfo>) {
    return this.http.post<{ message: string; data: IFarm }>("farms", {
      farm,
      technicalInfo,
    });
  }

  getMyFarms(): Observable<IPaginatedFarmsResponse> {
    return this.http.get<IPaginatedFarmsResponse>("farms/my-farms");
  }

  farmById(id: string | number) {
    return this.http.get<{ message: string; data: IFarmResponse; meta: any }>(
      `farms/${id}`
    );
  }

  removeFarm(id: string | number) {
    return this.http.delete<{ message: string }>(`farms/${id}`);
  }

  updateFarm(farm: IFarm, technicalInfo: IFarmTechnicalInfo | null) {
    // Assuming backend expects both farm and technicalInfo in the body
    return this.http.put<{ message: string; data: IFarm }>(`farms/${farm.id}`, {
      farm,
      technicalInfo,
    });
  }
}
