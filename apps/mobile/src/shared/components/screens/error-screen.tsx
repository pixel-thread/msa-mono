import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/button';
import { Text } from '../ui/text';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorScreen = ({
  title = 'Something went wrong',
  message,
  description = message ?? 'There was an error processing your request. Please try again.',
  onRetry,
  retryText = 'Retry',
}: ErrorScreenProps) => {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="items-center gap-4">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <View className="items-center gap-2">
          <Text variant="heading" size="xl" weight="bold" className="text-center">
            {title}
          </Text>
          <Text variant="subtext" className="text-center leading-5">
            {description}
          </Text>
        </View>

        {onRetry && (
          <Button variant="default" onPress={onRetry} className="mt-4">
            {retryText}
          </Button>
        )}
      </View>
    </View>
  );
};
