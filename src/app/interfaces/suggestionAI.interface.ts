export interface ISuggestionAIRequest {
    prompt: string;
    farmId: number;
  }
  
  export interface ISuggestionAIResponse {
    message: string;
    data: string;
    meta: {
      method: string;
      url: string;
      totalPages: number;
      totalElements: number;
      pageNumber: number;
      pageSize: number;
    };
  }
  