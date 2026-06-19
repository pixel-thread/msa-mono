import { InternalAxiosRequestConfig } from 'axios';
import { SECURE_STORE_KEYS } from '@src/shared/constants';
import uuid from 'react-native-uuid';
import 'react-native-get-random-values';
import { getDeviceType } from '@utils/helper/get-device-type';
import { SecureStorageManager } from '@src/shared/store';

/**
 * Creates the request interceptor that attaches the access token and device headers
 * to every outgoing request.
 *
 * @returns The request interceptor function.
 */
export const createRequestInterceptor = () => {
  return async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStorageManager.getItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
    config.headers['x-trace-id'] = uuid.v4();
    config.headers['x-device-type'] = getDeviceType();
    config.headers['x-association-slug'] = process.env.EXPO_PUBLIC_ASSOCIATION_SLUG || 'unknown';

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  };
};
