import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ISuggestionAIRequest, ISuggestionAIResponse } from "../interfaces/suggestionAI.interface";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SuggestionAIService {
  private http = inject(HttpClient);

  generateSuggestion(body: ISuggestionAIRequest): Observable<ISuggestionAIResponse> {
    return this.http.post<ISuggestionAIResponse>("ai-suggestions/generate", body);
  }

  saveSuggestion(body: any): Observable<any> {
    return this.http.post<ISuggestionAIResponse>("ai-suggestions", body);
  }
  getSuggestions(page: number, size: number): Observable<any> {
    return this.http.get<any>(`ai-suggestions?page=${page}&size=${size}`);
  }
  
  deleteSuggestion(id: number): Observable<any> {
    return this.http.delete(`ai-suggestions/${id}`);
  }
  
}
