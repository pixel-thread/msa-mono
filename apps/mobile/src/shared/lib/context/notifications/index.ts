import * as Notifications from 'expo-notifications';
import { createContext } from 'react';

interface NotificationContextType {
  notification: Notifications.Notification | undefined;
}

interface PushNotificationContextType {
  expoPushToken: string | undefined;
  isRegistered: boolean;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);