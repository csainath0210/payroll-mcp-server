import { PAYROLL_BASE_URL, RAZORPAY_BASE_URL, STUB } from "./constants.js";
import { ApiConfig, ApiResponse } from "./types.js";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

/**
 * Creates a Basic Authentication header using merchant ID and secret
 * @returns The Basic Auth header value or empty string if credentials are missing
 */
// export const createBasicAuthHeader = (): string => {
//   const merchantKey = process.env.MERCHANT_KEY;
//   const merchantSecret = process.env.MERCHANT_SECRET;

//   if (!merchantKey || !merchantSecret) {
//     console.error("Missing merchant credentials in .env file");
//     return "";
//   }

//   // Create base64 encoded credentials
//   const credentials = `${merchantKey}:${merchantSecret}`;
//   const encodedCredentials = Buffer.from(credentials).toString("base64");

//   return `Basic ${encodedCredentials}`;
// };

export class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const headers = {
        "Content-Type": "application/json",
        ...this.config.headers,
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          data: data as T,
          error: response.statusText,
          status: response.status,
        };
      }

      return {
        data: data as T,
        status: response.status,
      };
    } catch (error) {
      return {
        data: null as T,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        status: 500,
      };
    }
  }

  async get<T>(
    endpoint: string,
    options: { headers?: Record<string, string> } = {}
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: "GET",
      headers: options.headers,
    });
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    options: { headers?: Record<string, string> } = {}
  ): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers: options.headers,
    });
  }
}

// Initialize API client with base URL and default headers including Basic Auth
// export const apiClient = new ApiClient({
//   baseUrl: RAZORPAY_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: createBasicAuthHeader(),
//   },
// });

export const payrollApiClient = new ApiClient({
  baseUrl: PAYROLL_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});