import { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { SECURE_STORE_KEYS } from '@src/shared/constants';
import { isAuthPath } from './constants';
import {
  isRefreshing,
  failedQueue,
  setRefreshing,
  processQueue,
  refreshToken,
} from './token-refresher';

/**
 * Creates the response interceptor that handles 401 errors by attempting
 * to refresh the access token and retrying the failed request.
 *
 * Auth-path errors are returned directly to the caller without triggering
 * the refresh flow.
 *
 * @param apiClient - The Axios instance used to retry failed requests.
 * @returns A pair of [onFulfilled, onRejected] handlers for axios.interceptors.response.use().
 */
export const createResponseInterceptor = (apiClient: AxiosInstance) => {
  return [
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (!originalRequest) {
        return Promise.reject(error);
      }

      const requestPath = originalRequest.url ?? '';

      // If the error occurred on an auth path, resolve the response so the UI can handle the error message
      if (isAuthPath(requestPath)) {
        if (error.response) return Promise.resolve(error.response);
        return Promise.reject(error);
      }

      // Handle 401 Unauthorized errors by attempting to refresh the token
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If a refresh is already in progress, queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(apiClient(originalRequest));
              },
              reject,
            });
          });
        }

        originalRequest._retry = true;
        setRefreshing(true);

        try {
          const newToken = await refreshToken();
          processQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and reject all queued requests
          processQueue(refreshError, null);

          await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
          await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
          await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.MFA_TEMP_TOKEN);

          // Resolve the original 401 so the application-level handlers can manage the logout/redirect
          if (error.response) return Promise.resolve(error.response);
          return Promise.reject(error);
        } finally {
          setRefreshing(false);
        }
      }

      // Reject other errors normally
      return Promise.reject(error);
    },
  ] as const;
};
