/**
 * api.ts
 * 
 * Centralized API client configuration and interceptors
 * Handles authentication, error handling, and request/response formatting
 */

import Cookies from 'js-cookie';
import { store, logout } from '@/store';
import { getAuthHeaders, refreshAccessToken } from '@/utils/auth';

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_TIMEOUT = 60000; // Increased to 60 seconds for long-running operations

// Log API configuration for debugging
console.log('API Configuration:', { 
  API_URL, 
  API_TIMEOUT,
  NODE_ENV: process.env.NODE_ENV
});

/**
 * Custom API error class with additional properties
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
 * Handles request timeout
 * 
 * @param ms Timeout duration in milliseconds
 * @param operationType Type of operation for more descriptive error message
 * @returns Promise that rejects after specified timeout
 */
const timeoutPromise = (ms: number, operationType: string = 'request'): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new ApiError(`${operationType} hết thời gian chờ sau ${ms/1000} giây`, 408));
    }, ms);
  });
};

/**
 * Extract user-friendly error message from various error response formats
 * 
 * @param data Error response data
 * @param status HTTP status code
 * @returns User-friendly error message
 */
const extractErrorMessage = (data: any, status: number): string => {
  // Default error messages based on status code
  const defaultMessages: Record<number, string> = {
    400: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
    401: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.',
    403: 'Bạn không có quyền truy cập tài nguyên này.',
    404: 'Không tìm thấy dữ liệu yêu cầu.',
    409: 'Dữ liệu bị trùng lặp. Vui lòng kiểm tra lại thông tin.',
    422: 'Dữ liệu không đúng định dạng. Vui lòng kiểm tra lại.',
    500: 'Lỗi máy chủ. Vui lòng thử lại sau.',
    503: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.'
  };
  
  // Handle common login/register error cases
  if (typeof data === 'string') {
    if (data.includes('credentials') || data.includes('password') || data.includes('invalid')) {
      return 'Thông tin đăng nhập không chính xác. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.';
    }
    
    if (data.includes('duplicate') || data.includes('already exists')) {
      return 'Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra lại tên đăng nhập, email hoặc số CMND/CCCD.';
    }
    
    return data;
  }
  
  // Handle object data format with message/error fields
  if (typeof data === 'object' && data !== null) {
    // Check various common error fields
    if (data.message && typeof data.message === 'string') {
      return translateErrorMessage(data.message);
    }
    
    if (data.error && typeof data.error === 'string') {
      return translateErrorMessage(data.error);
    }
    
    if (data.errorMessage && typeof data.errorMessage === 'string') {
      return translateErrorMessage(data.errorMessage);
    }
    
    // Handle validation errors array
    if (data.errors && Array.isArray(data.errors)) {
      const messages = data.errors
        .map((err: any) => err.message || err)
        .filter(Boolean);
      
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }
  }
  
  // Return default message for this status code or generic error
  return defaultMessages[status] || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
};

/**
 * Translate common English error messages to Vietnamese
 * 
 * @param message Error message in English
 * @returns Vietnamese translation or original message
 */
const translateErrorMessage = (message: string): string => {
  // Map of common English error phrases to Vietnamese
  const errorTranslations: Record<string, string> = {
    'Invalid credentials': 'Thông tin đăng nhập không chính xác',
    'User not found': 'Không tìm thấy người dùng',
    'Username already exists': 'Tên đăng nhập đã tồn tại',
    'Email already in use': 'Email đã được sử dụng',
    'Invalid token': 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
    'Password incorrect': 'Mật khẩu không chính xác',
    'Unauthorized': 'Bạn không có quyền truy cập',
    'Not found': 'Không tìm thấy dữ liệu yêu cầu',
    'Bad request': 'Yêu cầu không hợp lệ',
    'Validation failed': 'Dữ liệu không hợp lệ',
    'Server error': 'Lỗi máy chủ, vui lòng thử lại sau'
  };
  
  // Check for exact matches
  if (errorTranslations[message]) {
    return errorTranslations[message];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(errorTranslations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Translation for common duplicate error messages
  if (message.includes('duplicate') || message.includes('already exists')) {
    return 'Thông tin đã tồn tại trong hệ thống';
  }
  
  // Return original message if no translation found
  return message;
};

/**
 * Process API response
 * 
 * @param response Fetch response object
 * @returns Parsed response data
 * @throws ApiError if response is not OK
 */
const processResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  let data;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch (err) {
    console.error('Error parsing response:', err);
    data = { message: 'Failed to parse response' };
  }
  
  console.log(`API Response [${response.status}]:`, data);
  
  if (!response.ok) {
    // Handle 401 Unauthorized - attempt to refresh token
    if (response.status === 401) {
      const newToken = await refreshAccessToken(API_URL);
      
      if (newToken) {
        // Token refreshed successfully, retry original request
        return null; // Caller should retry with new token
      }
    }
    
    // Get user-friendly error message
    const errorMessage = extractErrorMessage(data, response.status);
    
    // For cases where the backend returns a 404 with "No applications found"
    // we might want to return an empty array instead of throwing an error
    if (response.status === 404 && 
        (errorMessage.includes('applications') || errorMessage.includes('not found'))) {
      if (errorMessage.includes('applications')) {
        return { applications: [] };
      }
      // For other "not found" resources, return appropriate empty structures
      return { data: [] };
    }
    
    throw new ApiError(
      errorMessage, 
      response.status,
      data
    );
  }
  
  // For successful responses, ensure we're returning a structure the app components expect
  // If the data structure already contains the expected fields, return it as is
  if (typeof data === 'object' && data !== null) {
    // Handle our standardized server response format
    if (data.status === 'success' && data.data) {
      // Return the data field as the main response
      return {
        status: 'success',
        data: data.data,
        message: data.message
      };
    }
    
    // If data doesn't match our standard structure, wrap it
    if (!data.data && !data.status) {
      return {
        status: 'success',
        data,
        message: 'Operation successful'
      };
    }
  }
  
  // Return the data as is if it doesn't match any of our transformation cases
  return data;
};

/**
 * Main API client for making requests to the backend
 */
export const apiClient = {
  /**
   * Make a GET request
   * 
   * @param endpoint API endpoint (without base URL)
   * @param options Additional fetch options
   * @returns Promise with response data
   */
  get: async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await Promise.race([
        fetch(url, {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
          },
          ...options
        }),
        timeoutPromise(API_TIMEOUT)
      ]);
      
      const result = await processResponse(response);
      
      // If result is null, token was refreshed and we should retry
      if (result === null) {
        return apiClient.get(endpoint, options);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Lỗi kết nối: ${error.message}`, 500);
    }
  },
  
  /**
   * Make a POST request
   * 
   * @param endpoint API endpoint (without base URL)
   * @param data Request body data
   * @param options Additional fetch options
   * @returns Promise with response data
   */
  post: async (endpoint: string, data: any, options: RequestInit = {}): Promise<any> => {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await Promise.race([
        fetch(url, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
            ...(options.headers || {})
          },
          body: JSON.stringify(data),
          ...options
        }),
        timeoutPromise(API_TIMEOUT)
      ]);
      
      const result = await processResponse(response);
      
      // If result is null, token was refreshed and we should retry
      if (result === null) {
        return apiClient.post(endpoint, data, options);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Lỗi kết nối: ${error.message}`, 500);
    }
  },
  
  /**
   * Make a PUT request
   * 
   * @param endpoint API endpoint (without base URL)
   * @param data Request body data
   * @param options Additional fetch options
   * @returns Promise with response data
   */
  put: async (endpoint: string, data: any, options: RequestInit = {}): Promise<any> => {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await Promise.race([
        fetch(url, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
            ...(options.headers || {})
          },
          body: JSON.stringify(data),
          ...options
        }),
        timeoutPromise(API_TIMEOUT)
      ]);
      
      const result = await processResponse(response);
      
      // If result is null, token was refreshed and we should retry
      if (result === null) {
        return apiClient.put(endpoint, data, options);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Lỗi kết nối: ${error.message}`, 500);
    }
  },
  
  /**
   * Make a DELETE request
   * 
   * @param endpoint API endpoint (without base URL)
   * @param options Additional fetch options
   * @returns Promise with response data
   */
  delete: async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await Promise.race([
        fetch(url, {
          method: 'DELETE',
          headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
          },
          ...options
        }),
        timeoutPromise(API_TIMEOUT)
      ]);
      
      const result = await processResponse(response);
      
      // If result is null, token was refreshed and we should retry
      if (result === null) {
        return apiClient.delete(endpoint, options);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Lỗi kết nối: ${error.message}`, 500);
    }
  },
  
  /**
   * Make a PATCH request for partial updates
   * 
   * @param endpoint API endpoint (without base URL)
   * @param data Request body data
   * @param options Additional fetch options
   * @returns Promise with response data
   */
  patch: async (endpoint: string, data: any, options: RequestInit = {}): Promise<any> => {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      const response = await Promise.race([
        fetch(url, {
          method: 'PATCH',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
            ...(options.headers || {})
          },
          body: JSON.stringify(data),
          ...options
        }),
        timeoutPromise(API_TIMEOUT)
      ]);
      
      const result = await processResponse(response);
      
      // If result is null, token was refreshed and we should retry
      if (result === null) {
        return apiClient.patch(endpoint, data, options);
      }
      
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(`Lỗi kết nối: ${error.message}`, 500);
    }
  }
}; 