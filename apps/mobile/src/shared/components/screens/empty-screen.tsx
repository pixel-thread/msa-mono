import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/button';
import { Text } from '../ui/text';

interface EmptyScreenProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  description?: string;
  refresh?: () => void;
}

export const EmptyScreen = ({
  icon = 'documents-outline',
  title = 'Nothing here',
  description = 'There are no items to display.',
  refresh,
}: EmptyScreenProps) => {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="items-center gap-6">
        <View className="bg-slate-100 p-6">
          <Ionicons name={icon} size={64} color="#94A3B8" />
        </View>
        <View className="items-center gap-2">
          <Text weight="bold" size="xl" className="text-center">
            {title}
          </Text>
          <Text variant="subtext" className="text-center leading-5">
            {description}
          </Text>
        </View>

        {refresh && (
          <Button variant="outline" onPress={refresh} className="mt-2">
            Refresh
          </Button>
        )}
      </View>
    </View>
  );
};
