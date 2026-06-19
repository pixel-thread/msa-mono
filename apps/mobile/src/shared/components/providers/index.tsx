import { Stack } from 'expo-router';
import { AuthProvider } from './auth';
import React from 'react';
import { AuthGuard } from '../auth';
import { NotificationProvider, PushNotificationProvider } from './notifications';
import { ThemeProvider } from './theme.provider';
import { OtaUpdateProvider } from './ota-update';
import { QueryProvider } from './query-provider';

export * from './auth';
export * from './notifications';
export * from './theme.provider';
export * from './ota-update';
export * from './query-provider';

export const AppProviders = () => {
  return (
    <React.Fragment>
      <QueryProvider>
        <ThemeProvider>
          <PushNotificationProvider>
            <AuthProvider>
              <OtaUpdateProvider>
                <AuthGuard>
                  <NotificationProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                  </NotificationProvider>
                </AuthGuard>
              </OtaUpdateProvider>
            </AuthProvider>
          </PushNotificationProvider>
        </ThemeProvider>
      </QueryProvider>
    </React.Fragment>
  );
};
