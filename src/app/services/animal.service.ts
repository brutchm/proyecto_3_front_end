
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IAnimal, IGroupAnimal } from '../interfaces/group-animal.interface';
import { Observable } from 'rxjs';
import { IFarm } from './farm.service';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private http = inject(HttpClient);

  getAnimalGroups(farmId: string | number): Observable<{data: IGroupAnimal[], message: string}> {
    return this.http.get<{data: IGroupAnimal[], message: string}>(`farms/${farmId}/animal-groups`);
  }

  getAnimalGroupById(farmId: string | number, groupId: string | number): Observable<{data: IGroupAnimal, message: string}> {
    return this.http.get<{data: IGroupAnimal, message: string}>(`farms/${farmId}/animal-groups/${groupId}`);
  }

  createAnimalGroup(group: Partial<IGroupAnimal> & { farmId: string | number }):  Observable<{data: IGroupAnimal, message: string}> {
    const { farmId, ...body } = group;
    return this.http.post<{data: IGroupAnimal, message: string}>(`farms/${farmId}/animal-groups`, body);
  }
  
  deleteAnimalGroup(farmId: string | number, groupId: string | number): Observable<any> {
    return this.http.delete(`farms/${farmId}/animal-groups/${groupId}`);
  }

  updateAnimalGroup(farmId: string | number, groupId: string | number, group: Partial<IGroupAnimal>): Observable<{data: IGroupAnimal, message: string}> {
    return this.http.put<{data: IGroupAnimal, message: string}>(`farms/${farmId}/animal-groups/${groupId}`, group);
  }


  /*Animales que se asocian a los grupos*/
  createAnimal(group: Partial<IGroupAnimal> & { farmId: string | number }):  Observable<{data: IGroupAnimal, message: string}> {
    const { farmId, ...body } = group;
    return this.http.post<{data: IGroupAnimal, message: string}>(`farms/${farmId}/animals`, body);
  }

  getAnimalsByGroup(farmId: string | number, groupId: string | number): Observable<{ data: IAnimal[], message: string }> {
    return this.http.get<{ data: IAnimal[], message: string }>(`farms/${farmId}/animals/group/${groupId}`);
  }

updateAnimal(farmId: string | number,animalId: string | number,animal: Partial<IGroupAnimal>): Observable<{ data: IGroupAnimal, message: string }> {
  return this.http.put<{ data: IGroupAnimal, message: string }>(
    `farms/${farmId}/animals/${animalId}`,
    animal
  );
}

deleteAnimal(farmId: string | number, animalId: string | number): Observable<any> {
  return this.http.delete<any>(`farms/${farmId}/animals/${animalId}`);
}
getFarmById(farmId: string): Observable<IFarm> {
  return this.http.get<IFarm>(`/api/farms/${farmId}`);
}


  
}
