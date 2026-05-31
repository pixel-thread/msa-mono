import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT || 'production';

  const ASSOCIATION_SLUG = process.env.EXPO_PUBLIC_ASSOCIATION_SLUG;

  const getName = () => {
    if (variant === 'development') return `${ASSOCIATION_SLUG?.toUpperCase()} (Dev)`;
    if (variant === 'preview') return `${ASSOCIATION_SLUG?.toUpperCase()} (Preview)`;
    return ASSOCIATION_SLUG?.toUpperCase() || 'MFSA';
  };

  const getIdentifier = () => {
    if (variant === 'development') return 'com.pixelthread.msa';
    if (variant === 'preview') return 'com.pixelthread.msa';
    return 'com.pixelthread.msa';
  };

  return {
    ...config,
    name: getName(),
    slug: 'msa',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/shared/assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'msa',
    platforms: ['ios', 'android'],
    splash: {
      image: './src/shared/assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: getIdentifier(),
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './src/shared/assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: getIdentifier(),
      googleServicesFile: process.env.EXPO_PUBLIC_GOOGLE_SERVICE,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './src/shared/assets/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-notifications',
      'expo-font',
      [
        'expo-system-ui',
        {
          androidStatusBarTranslucent: false,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '76bf6558-f870-4eb0-b4a2-698184fefb41',
      },
    },
    owner: 'pixel-thread',
    updates: {
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/76bf6558-f870-4eb0-b4a2-698184fefb41',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  };
};
