import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@src/shared/store';
import { useSecureTokenStore } from '@features/auth/store';
import { setSessionExpiredHandler } from '@src/shared/lib/api-client/session-expired-handler';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { fetchUser, setHydrated, isAuthLoading, isAuthenticated } = useAuthStore();
  const { init: initTokens } = useSecureTokenStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      await initTokens();
      if (mounted) {
        setHydrated(true);
        setIsReady(true);
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [initTokens, setHydrated]);

  useEffect(() => {
    if (!isReady) return;
    fetchUser();
  }, [isReady, fetchUser]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      useAuthStore.setState({ user: null, isAuthenticated: false, isAuthLoading: false });
      useSecureTokenStore.getState().clearAll();
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    if (!isReady || isAuthLoading) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/sign-in');
    }
  }, [isReady, isAuthLoading, isAuthenticated, router]);

  return <>{children}</>;
};
