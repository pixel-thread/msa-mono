import { env } from '@src/env';
import { logger } from '@src/shared/logger';
import { navigate } from '@src/shared/router';
import { useAuthStore } from '@src/shared/stores/auth';
import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import cookie from 'react-cookies';

import { attemptTokenRefresh } from './axios-refresh';

type ExtendedConfig = InternalAxiosRequestConfig & { __startTime?: number };

const isLogEndpoint = (url: string) => url.includes('/logs/batch');

export function setupInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const traceId = crypto.randomUUID();
      const method = (config.method?.toUpperCase() ?? 'UNKNOWN') as string;
      const path = config.url ?? '';

      config.headers['x-trace-id'] = traceId;
      config.headers['x-association-slug'] = env.NEXT_PUBLIC_ASSOCIATION_SLUG;

      const token = cookie.load('csrf_token');

      if (token) {
        config.headers['x-csrf-token'] = token;
      }

      (config as ExtendedConfig).__startTime = Date.now();

      if (!isLogEndpoint(path)) {
        logger.info(`[→ ${method}] ${path}`, {
          traceId,
        });
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response) => {
      const config = response.config as ExtendedConfig;
      const method = (config.method?.toUpperCase() ?? 'UNKNOWN') as string;
      const path = config.url ?? '';
      const duration = config.__startTime ? Date.now() - config.__startTime : 0;
      const traceId = (config.headers?.['x-trace-id'] as string) ?? '';

      if (!isLogEndpoint(path)) {
        logger.info(`[← ${method}] ${path} — ${response.status} (${duration}ms)`, {
          traceId,
          status: response.status,
          durationMs: duration,
          error: response?.data?.error,
        });
      }

      return response;
    },
    async (error) => {
      const originalRequest = error.config as ExtendedConfig & { _retry?: boolean };
      const method = (originalRequest?.method?.toUpperCase() ?? 'UNKNOWN') as string;
      const path = originalRequest?.url ?? '';
      const duration = originalRequest?.__startTime ? Date.now() - originalRequest.__startTime : 0;
      const traceId = (originalRequest?.headers?.['x-trace-id'] as string) ?? '';
      const status = error.response?.status ?? 0;
      const errorMessage = error.message;

      if (!isLogEndpoint(path)) {
        logger.error(`[← ${method}] ${path} — ${status} (${duration}ms) — ${errorMessage}`, {
          traceId,
          status,
          durationMs: duration,
          error: errorMessage,
        });
      }

      if (status === 403 && originalRequest && !originalRequest._retry) {
        const isCsrfError = error.response?.data?.message
          ?.toLowerCase()
          ?.includes('invalid csrf token');

        if (isCsrfError) {
          originalRequest._retry = true;
          const token = cookie.load('csrf-token');
          if (token) {
            originalRequest.headers['X-CSRF-Token'] = token;
            return client(originalRequest);
          }
        }
      }

      if (status === 401 && originalRequest && !originalRequest._retry) {
        const url = originalRequest.url || '';
        const isAuthAction =
          url.includes('/auth/sign-in') ||
          url.includes('/auth/sign-up') ||
          url.includes('/auth/refresh');

        if (isAuthAction) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        const refreshed = await attemptTokenRefresh();

        if (refreshed) {
          return client(originalRequest);
        }

        useAuthStore.getState().setUser(null);
        navigate('/sign-in');
      }

      return Promise.reject(error);
    },
  );
}
