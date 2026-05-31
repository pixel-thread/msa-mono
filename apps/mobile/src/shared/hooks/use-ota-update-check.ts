import * as Updates from 'expo-updates';
import { useCallback } from 'react';
import { useOtaUpdateStore } from '@src/shared/store';
import { isConnectedToNetwork } from '@utils/helper/is-connect-to-network';
import { logger } from '@src/shared/utils';

export function useOtaUpdateCheck() {
  const { setChecking, setUpdateAvailable, setDownloading, setReady, setError } =
    useOtaUpdateStore();

  const checkForUpdate = useCallback(async () => {
    const connected = await isConnectedToNetwork();
    if (!connected) {
      return;
    }

    try {
      setChecking(true);
      setError(null);

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdateAvailable(true);
      }
    } catch (error) {
      logger.error('Failed to check for OTA update', { error });
      setError('Failed to check for updates');
    } finally {
      setChecking(false);
    }
  }, [setChecking, setUpdateAvailable, setError]);

  const downloadUpdate = useCallback(async () => {
    try {
      setDownloading(true);
      setError(null);

      await Updates.fetchUpdateAsync();
      setDownloading(false);
      setReady(true);
    } catch (error) {
      logger.error('Failed to download OTA update', { error });
      setDownloading(false);
      setError('Failed to download update');
    }
  }, [setDownloading, setReady, setError]);

  const applyUpdate = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      logger.error('Failed to apply OTA update', { error });
      setError('Failed to apply update');
    }
  }, [setError]);

  return {
    checkForUpdate,
    downloadUpdate,
    applyUpdate,
  };
}
