import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IGroupAnimal } from '../interfaces/group-animal.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private http = inject(HttpClient);

  getAnimalGroups(farmId: string | number): Observable<{data: IGroupAnimal[], message: string}> {
    return this.http.get<{data: IGroupAnimal[], message: string}>(`farms/${farmId}/animal-groups`);
  }

  getAnimalGroupById(farmId: string | number, groupId: string | number): Observable<IGroupAnimal> {
    return this.http.get<IGroupAnimal>(`farms/${farmId}/animal-groups/${groupId}`);
  }

  createAnimalGroup(group: Partial<IGroupAnimal> & { farmId: string | number }): Observable<any> {
    const { farmId, ...body } = group;
    return this.http.post(`farms/${farmId}/animal-groups`, body);
  }
}
