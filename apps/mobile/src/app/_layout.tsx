import '@src/shared/styles/global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});
import {
  useFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@components/providers';
import { GlobalErrorBoundary } from '@components/common/error-boundary';
import React from 'react';
import { Toaster } from '@components/ui/toaster';

export const unstable_settings = {
  initialRouteName: '(drawer)',
};

const queryClient = new QueryClient({
  mutationCache: new MutationCache(),
  queryCache: new QueryCache(),
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      retry: 3,
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 1,
    },
  },
});

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  React.useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && error) {
    return null;
  }

  return (
    <GlobalErrorBoundary>
      <StatusBar translucent={false} style="auto" />
      <SafeAreaProvider>
        <GestureHandlerRootView className="flex-1 bg-background">
          <QueryClientProvider client={queryClient}>
            <AppProviders />
          </QueryClientProvider>
          <Toaster />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </GlobalErrorBoundary>
  );
}
