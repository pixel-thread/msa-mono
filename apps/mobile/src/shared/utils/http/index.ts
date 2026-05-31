import apiClient from '@src/shared/lib/api-client/index';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { PaginationMeta } from '@src/shared/types/pagination';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: PaginationMeta;
  error?: string | Record<string, unknown>;
}

export const handleAxiosError = <T>(error: unknown): ApiResponse<T> => {
  let errorMessage = 'Something went wrong. Please try again.';

  let errorDetails: string | Record<string, unknown> = '';

  if (error instanceof AxiosError) {
    if (error.response) {
      errorMessage = (error.response.data as { message?: string })?.message || errorMessage;
      errorDetails =
        (error.response.data as { error?: string | Record<string, unknown> })?.error ||
        error.response.data ||
        '';
    } else if (error.request) {
      errorMessage = 'Please check your connection.';
    } else {
      errorMessage = error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return {
    success: false,
    message: errorMessage,
    error: errorDetails,
    data: null,
  };
};

const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> => {
  return {
    success: response.data.success,
    message: response.data.message || 'Request successfully',
    data: response.data.data ?? null,
    meta: response?.data?.meta,
  };
};

const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.get<ApiResponse<T>>(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  },

  post: async <T>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.post<ApiResponse<T>>(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  },

  put: async <T>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.put<ApiResponse<T>>(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  },

  patch: async <T>(
    url: string,
    data?: object,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleAxiosError<T>(error);
    }
  },
};

export default http;
