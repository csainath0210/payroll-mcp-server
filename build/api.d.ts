import { ApiConfig, ApiResponse } from "./types.js";
/**
 * Creates a Basic Authentication header using merchant ID and secret
 * @returns The Basic Auth header value or empty string if credentials are missing
 */
export declare class ApiClient {
    private config;
    constructor(config: ApiConfig);
    private fetch;
    get<T>(endpoint: string, options?: {
        headers?: Record<string, string>;
    }): Promise<ApiResponse<T>>;
    post<T>(endpoint: string, body: unknown, options?: {
        headers?: Record<string, string>;
    }): Promise<ApiResponse<T>>;
}
export declare const payrollApiClient: ApiClient;
