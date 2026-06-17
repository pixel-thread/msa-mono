import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { SECURE_STORE_KEYS } from '@src/shared/constants';
import { SecureStorageManager } from '@src/shared/store';

interface SecureTokenState {
  accessToken: string | null;
  refreshToken: string | null;
  mfaTempToken: string | null;
  setAccessToken: (token: string | null) => Promise<void>;
  setRefreshToken: (token: string | null) => Promise<void>;
  setMfaTempToken: (token: string | null) => Promise<void>;
  clearAll: () => Promise<void>;
  init: () => Promise<void>;
}

export const useSecureTokenStore = create<SecureTokenState>((set) => ({
  accessToken: null,
  refreshToken: null,
  mfaTempToken: null,

  init: async () => {
    const [accessToken, refreshToken, mfaTempToken] = await Promise.all([
      SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(SECURE_STORE_KEYS.MFA_TEMP_TOKEN),
    ]);
    set({ accessToken, refreshToken, mfaTempToken });
  },

  setAccessToken: async (token) => {
    if (token) {
      SecureStorageManager.setItem(SECURE_STORE_KEYS.ACCESS_TOKEN, token);
    } else {
      SecureStorageManager.removeItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
    }
    set({ accessToken: token });
  },

  setRefreshToken: async (token) => {
    if (token) {
      SecureStorageManager.setItem(SECURE_STORE_KEYS.REFRESH_TOKEN, token);
    } else {
      SecureStorageManager.removeItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
    }
    set({ refreshToken: token });
  },

  setMfaTempToken: async (token) => {
    if (token) {
      SecureStorageManager.setItem(SECURE_STORE_KEYS.MFA_TEMP_TOKEN, token);
    } else {
      SecureStorageManager.removeItem(SECURE_STORE_KEYS.MFA_TEMP_TOKEN);
    }
    set({ mfaTempToken: token });
  },

  clearAll: async () => {
    await Promise.all([
      SecureStorageManager.removeItem(SECURE_STORE_KEYS.ACCESS_TOKEN),
      SecureStorageManager.removeItem(SECURE_STORE_KEYS.REFRESH_TOKEN),
      SecureStorageManager.removeItem(SECURE_STORE_KEYS.MFA_TEMP_TOKEN),
    ]);
    set({ accessToken: null, refreshToken: null, mfaTempToken: null });
  },
}));
