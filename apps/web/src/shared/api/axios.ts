import { env } from '@src/env';
import axios, { AxiosInstance } from 'axios';

import { setupInterceptors } from './axios-interceptors';

export const axiosClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

setupInterceptors(axiosClient);
