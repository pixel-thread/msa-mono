import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuthStore } from '@src/shared/store';
import { useSecureTokenStore } from '@features/auth/store';
import { setSessionExpiredHandler } from '@src/shared/lib/api-client/session-expired-handler';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { fetchUser, refreshUser, setHydrated } = useAuthStore();
  const { init: initTokens } = useSecureTokenStore();

  useEffect(() => {
    const bootstrap = async () => {
      await initTokens();

      if (!useAuthStore.persist.hasHydrated()) {
        await new Promise<void>((resolve) => {
          const unsub = useAuthStore.persist.onFinishHydration(() => {
            unsub();
            resolve();
          });
        });
      }

      setHydrated(true);

      const user = useAuthStore.getState().user;
      if (user) {
        refreshUser();
      } else {
        fetchUser();
      }
    };
    bootstrap();
  }, [initTokens, setHydrated, refreshUser, fetchUser]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const user = useAuthStore.getState().user;
        if (user) {
          refreshUser();
        }
      }
    });
    return () => subscription.remove();
  }, [refreshUser]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      useAuthStore.setState({ user: null, isAuthenticated: false, isAuthLoading: false });
      useSecureTokenStore.getState().clearAll();
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  return <>{children}</>;
};
