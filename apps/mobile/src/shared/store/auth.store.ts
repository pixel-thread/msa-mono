import { create } from 'zustand';
import type { AuthUser } from '@src/features/auth/types';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SecureStorageManager } from './store-manager';
import http from '@utils/http';
import { SECURE_STORE_KEYS } from '../constants';
import { logger } from '../utils';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAuthLoading: true,
      isHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isAuthLoading: false }),
      fetchUser: async () => {
        set({ isAuthLoading: true });
        try {
          const refreshToken = await SecureStorageManager.getItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
          if (!refreshToken) {
            set({ user: null, isAuthenticated: false, isAuthLoading: false });
            return;
          }
          const response = await http.get<AuthUser>('/auth/me');
          if (response.success && response.data) {
            set({ user: response.data, isAuthenticated: true, isAuthLoading: false });
          } else {
            await SecureStorageManager.removeItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
            await SecureStorageManager.removeItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
            set({ user: null, isAuthenticated: false, isAuthLoading: false });
          }
        } catch (error) {
          logger.error('Failed to fetch user', { error });
          set({ user: null, isAuthenticated: false, isAuthLoading: false });
        }
      },
      logout: async () => {
        set({ isAuthLoading: true });
        const refreshToken = await SecureStorageManager.getItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          try {
            set({ isAuthLoading: true, isAuthenticated: false, user: null });
            await http.post('/auth/logout', { token: refreshToken });
            await SecureStorageManager.removeItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
            await SecureStorageManager.removeItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
          } catch (e) {
            set({ isAuthLoading: true, isAuthenticated: false, user: null });
            logger.error('Logout API call failed', { e });
          } finally {
            set({ isAuthLoading: false });
          }
        }
        set({ user: null, isAuthenticated: false, isAuthLoading: false });
      },
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => SecureStorageManager),
    }
  )
);
