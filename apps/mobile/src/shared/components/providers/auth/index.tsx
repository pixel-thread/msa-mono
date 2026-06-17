import { useEffect, useState } from 'react';
import * as Network from 'expo-network';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@src/shared/store';
import { useSecureTokenStore } from '@features/auth/store';
import { setSessionExpiredHandler } from '@src/shared/lib/api-client/session-expired-handler';
import { isConnectedToNetwork } from '@src/shared/utils/helper/is-connect-to-network';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { fetchUser, setHydrated, isAuthLoading, isAuthenticated } = useAuthStore();
  const { init: initTokens } = useSecureTokenStore();
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

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
    if (!isReady || !isConnected) return;
    fetchUser();
  }, [isReady, isConnected, fetchUser]);

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

  useEffect(() => {
    async function checkConnection() {
      const connected = await isConnectedToNetwork();
      setIsConnected(connected);
    }

    checkConnection();

    const subscription = Network.addNetworkStateListener((state) => {
      setIsConnected(Boolean(state.isConnected && state.isInternetReachable));
    });

    return () => subscription.remove();
  }, []);

  return <>{children}</>;
};
