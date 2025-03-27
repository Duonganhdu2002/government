/**
 * src/utils/api.ts
 * 
 * API client với mô hình hướng đối tượng
 * Xử lý xác thực, xử lý lỗi và định dạng request/response
 */

import { store } from '@/store/store';
import { logout } from '@/store/authSlice';
import { getAuthHeaders } from './authHeaders';

/**
 * Lớp định nghĩa lỗi API với các thuộc tính bổ sung
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Lớp cấu hình API
 */
class ApiConfig {
  private static instance: ApiConfig;
  private readonly baseUrl: string;
  private readonly timeout: number;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    this.timeout = 30000; // 30 seconds timeout
  }

  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig();
    }
    return ApiConfig.instance;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getTimeout(): number {
    return this.timeout;
  }

  public formatUrl(endpoint: string): string {
    // Check if the endpoint is already a full URL
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // Handle relative paths
    return `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }
}

/**
 * Lớp xử lý request HTTP
 */
class HttpClient {
  private readonly config: ApiConfig;

  constructor() {
    this.config = ApiConfig.getInstance();
  }

  /**
   * Tạo promise timeout
   */
  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new ApiError(`Request timeout after ${ms/1000} seconds`, 408));
      }, ms);
    });
  }

  /**
   * Xử lý response API
   */
  private async processResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let data;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (err) {
      console.error('Error parsing response:', err);
      data = { message: 'Failed to parse response' };
    }
    
    if (!response.ok) {
      // Handle 401 Unauthorized - force logout
      if (response.status === 401) {
        store.dispatch(logout());
      }
      
      // Get error message from response
      let errorMessage = 'API request failed';
      
      if (typeof data === 'object' && data !== null) {
        errorMessage = data.message || data.error || errorMessage;
      } else if (typeof data === 'string' && data.length > 0) {
        errorMessage = data;
      }
      
      throw new ApiError(
        errorMessage, 
        response.status,
        data
      );
    }
    
    return data;
  }

  /**
   * Lấy headers cho request
   */
  public getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      ...getAuthHeaders(),
      ...customHeaders
    };
  }

  /**
   * Thực hiện request với timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      this.createTimeoutPromise(this.config.getTimeout())
    ]);
  }

  /**
   * Thực hiện request HTTP
   */
  public async request(
    method: string, 
    endpoint: string, 
    options: RequestInit = {}, 
    data?: any
  ): Promise<any> {
    const url = this.config.formatUrl(endpoint);
    const headers = this.getHeaders(options.headers as Record<string, string>);
    
    const requestOptions: RequestInit = {
      method,
      headers,
      ...options
    };

    if (data) {
      if (data instanceof FormData) {
        // Khi sử dụng FormData, để browser tự thêm Content-Type
        delete headers['Content-Type'];
        requestOptions.body = data;
      } else {
        headers['Content-Type'] = 'application/json';
        requestOptions.body = JSON.stringify(data);
      }
    }

    try {
      const response = await this.fetchWithTimeout(url, requestOptions);
      return await this.processResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`${method} request failed: ${error.message}`, 500);
    }
  }
}

/**
 * Lớp API Client cung cấp các phương thức giao tiếp với API
 */
class ApiClient {
  private static instance: ApiClient;
  private readonly httpClient: HttpClient;

  private constructor() {
    this.httpClient = new HttpClient();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Lấy headers cho request API
   */
  public getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    return this.httpClient.getHeaders(customHeaders);
  }

  /**
   * Format URL từ endpoint
   */
  public formatUrl(endpoint: string): string {
    return ApiConfig.getInstance().formatUrl(endpoint);
  }

  /**
   * Thực hiện GET request
   */
  public async get(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.httpClient.request('GET', endpoint, options);
  }

  /**
   * Thực hiện POST request với JSON data
   */
  public async post(endpoint: string, data: any, options: RequestInit = {}): Promise<any> {
    return this.httpClient.request('POST', endpoint, options, data);
  }

  /**
   * Thực hiện POST request với FormData
   */
  public async postFormData(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<any> {
    return this.httpClient.request('POST', endpoint, options, formData);
  }

  /**
   * Thực hiện PUT request
   */
  public async put(endpoint: string, data: any, options: RequestInit = {}): Promise<any> {
    return this.httpClient.request('PUT', endpoint, options, data);
  }

  /**
   * Thực hiện PATCH request
   */
  public async patch(endpoint: string, data: any, options: RequestInit = {}): Promise<any> {
    return this.httpClient.request('PATCH', endpoint, options, data);
  }

  /**
   * Thực hiện DELETE request
   */
  public async delete(endpoint: string, options: RequestInit = {}): Promise<any> {
    return this.httpClient.request('DELETE', endpoint, options);
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance(); 