import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SecureStorageManager } from './store-manager';

interface OtaUpdateState {
  isUpdateAvailable: boolean;
  isDownloading: boolean;
  isReady: boolean;
  isChecking: boolean;
  dismissed: boolean;
  error: string | null;
  setUpdateAvailable: (available: boolean) => void;
  setDownloading: (downloading: boolean) => void;
  setReady: (ready: boolean) => void;
  setChecking: (checking: boolean) => void;
  setError: (error: string | null) => void;
  dismiss: () => void;
  reset: () => void;
}

export const useOtaUpdateStore = create<OtaUpdateState>()(
  persist(
    (set) => ({
      isUpdateAvailable: false,
      isDownloading: false,
      isReady: false,
      isChecking: false,
      dismissed: false,
      error: null,
      setUpdateAvailable: (available) => set({ isUpdateAvailable: available }),
      setDownloading: (downloading) => set({ isDownloading: downloading }),
      setReady: (ready) => set({ isReady: ready }),
      setChecking: (checking) => set({ isChecking: checking }),
      setError: (error) => set({ error }),
      dismiss: () => set({ dismissed: true, isUpdateAvailable: false }),
      reset: () =>
        set({
          isUpdateAvailable: false,
          isDownloading: false,
          isReady: false,
          isChecking: false,
          dismissed: false,
          error: null,
        }),
    }),
    {
      name: 'ota-update-storage',
      storage: createJSONStorage(() => SecureStorageManager),
    }
  )
);
