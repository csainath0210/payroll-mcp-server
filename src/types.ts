// API response type
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

// API client configuration
export interface ApiConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}