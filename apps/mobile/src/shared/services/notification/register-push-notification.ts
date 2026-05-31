import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { logger } from '@src/shared/utils/logger';

export async function registerForPushNotificationsAsync() {
  let token;

  // Physical device check is recommended for production
  // In a real app, you'd use expo-device's Device.isDevice
  // For now we assume native platforms are devices or support notifications
  if (Platform.OS === 'web') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    logger.warn('Failed to get push token for push notification!');
    return;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      throw new Error('Project ID not found in expo config. Ensure EAS is configured.');
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e) {
    logger.error('Error getting expo push token:', { error: e });
  }
  return token;
}
