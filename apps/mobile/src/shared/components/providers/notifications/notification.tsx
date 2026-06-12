import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Route, useRouter } from 'expo-router';

import { useAuthStore } from '@src/shared/store';
import http from '@src/shared/utils/http';
import { logger } from '@src/shared/utils/logger';
import { NotificationContext } from '@src/shared/lib/context/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const updateStatus = useCallback(
    async (id: string, payload: { isRead?: boolean; isReceived?: boolean }) => {
      try {
        await http.patch(`/notifications/${id}/status`, {
          ...payload,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to sync notification status:', { id, error });
      }
    },
    []
  );

  const onNotificationReceived = useCallback(
    async (noti: Notifications.Notification) => {
      setNotification(noti);
      const notificationId = noti.request.content.data?.id;
      if (notificationId) {
        await updateStatus(notificationId as string, { isReceived: true });
        logger.debug('Notification marked as Received (Foreground)');
      }
    },
    [updateStatus]
  );

  const onNotificationResponse = useCallback(
    async (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;

      if (data?.route) router.replace(data.route as Route);

      if (data?.id) {
        await updateStatus(data.id as string, { isRead: true });
        logger.debug('Notification marked as Read');
      }
    },
    [router, updateStatus]
  );

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isAuthenticated) {
        logger.debug('Syncing notifications');
        // TODO: sync notifications
        // http.post('/notifications/sync-received').catch(() => {});
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isAuthenticated]);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(onNotificationReceived);
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [onNotificationReceived, onNotificationResponse]);

  return (
    <NotificationContext.Provider value={{ notification }}>{children}</NotificationContext.Provider>
  );
};
