import { useEffect } from 'react';
import * as Network from 'expo-network';
import { useOtaUpdateCheck } from '@src/shared/hooks/use-ota-update-check';
import { useOtaUpdateStore } from '@src/shared/store';
import { isConnectedToNetwork } from '@src/shared/utils/helper/is-connect-to-network';
import { OtaUpdateModal } from './update-modal.component';

export const OtaUpdateProvider = ({ children }: { children: React.ReactNode }) => {
  const { checkForUpdate } = useOtaUpdateCheck();
  const { isUpdateAvailable, isReady, reset } = useOtaUpdateStore();

  useEffect(() => {
    if (__DEV__) {
      return;
    }

    async function checkConnection() {
      const connected = await isConnectedToNetwork();
      if (connected) {
        checkForUpdate();
      }
    }

    checkConnection();

    const subscription = Network.addNetworkStateListener((state) => {
      const connected = Boolean(state.isConnected && state.isInternetReachable);
      if (connected && !isUpdateAvailable && !isReady) {
        checkForUpdate();
      }
    });

    return () => subscription.remove();
  }, [checkForUpdate, isUpdateAvailable, isReady]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <>
      {children}
      <OtaUpdateModal />
    </>
  );
};
