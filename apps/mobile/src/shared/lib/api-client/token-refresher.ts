import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { SECURE_STORE_KEYS } from '@src/shared/constants';
import { logger } from '@utils/logger';
import { API_BASE_URL } from './constants';
import { QueueItem } from './types';
import { useSecureTokenStore } from '@src/features/auth/store/secure-token.store';

/** Flag indicating if a token refresh request is currently in flight */
export let isRefreshing = false;

/** List of requests waiting for the token refresh to complete */
export const failedQueue: QueueItem[] = [];

/** @internal */
export const setRefreshing = (value: boolean) => {
  isRefreshing = value;
};

/**
 * Processes the failed request queue after a refresh attempt.
 *
 * @param error - If provided, all queued requests will be rejected with this error.
 * @param token - If provided, all queued requests will be resolved with this new token.
 */
export const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue.length = 0;
};

/**
 * Performs a token refresh request using the stored refresh token.
 * Updates the SecureStore with new tokens upon success.
 *
 * @throws Error if no refresh token is found or if the refresh request fails.
 * @returns The new access token.
 */
export const refreshToken = async (): Promise<string> => {
  const refreshToken = await SecureStore.getItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  logger.debug('Refreshing token Started');
  const response = await axios.post<{
    data?: { access_token: string; refresh_token: string };
  }>(`${API_BASE_URL}/auth/refresh`, { token: refreshToken }, { withCredentials: true });
  logger.debug('Refreshing token Completed');

  const newAccessToken = response.data?.data?.access_token;

  if (!newAccessToken) {
    throw new Error('No access token in refresh response');
  }

  await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, newAccessToken);

  const { setAccessToken, setRefreshToken } = useSecureTokenStore.getState();
  setAccessToken(newAccessToken);

  const newRefreshToken = response.data?.data?.refresh_token;
  if (newRefreshToken) {
    await SecureStore.setItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN, newRefreshToken);
    setRefreshToken(newRefreshToken);
  }
  logger.debug('Token Refreshed');
  return newAccessToken;
};
