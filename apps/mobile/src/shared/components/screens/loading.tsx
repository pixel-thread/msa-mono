import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '../ui/text';

interface LoadingScreenProps {
  message?: string;
  description?: string;
}

export const LoadingScreen = ({
  message,
  description = message ?? 'Loading...',
}: LoadingScreenProps) => {
  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center gap-4">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text size="sm" variant="subtext" weight="medium">
          {description}
        </Text>
      </View>
    </View>
  );
};
