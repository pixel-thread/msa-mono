import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SecureStorageManager } from './store-manager';

interface NotificationState {
  isRegistered: boolean;
  setRegistered: (value: boolean) => void;

  isLinked: boolean;
  setLinked: (value: boolean) => void;
}

// Custom storage adapter for Expo SecureStore

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      isRegistered: false,
      setRegistered: (value) => set({ isRegistered: value }),
      isLinked: false,
      setLinked: (value) => set({ isLinked: value }),
    }),
    {
      name: 'notification-store',
      storage: createJSONStorage(() => SecureStorageManager),
    }
  )
);
