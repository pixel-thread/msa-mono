import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IconWithBadgeProps = {
  showBadge?: boolean;
  size?: number;
  color?: string;
  badgeColorClassName?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
  name?: keyof typeof Ionicons.glyphMap;
};

export const IconWithBadge = ({
  showBadge = true,
  size = 28,
  color = '#111827',
  badgeColorClassName = 'bg-red-500',
  onPress,
  accessibilityLabel = 'Notifications',
  testID,
  name = 'notifications-outline',
}: IconWithBadgeProps) => {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="relative self-start p-1"
      hitSlop={8}
      onPress={onPress}
      testID={testID}>
      <Ionicons color={color} name={name} size={size} />

      {showBadge && (
        <View
          className={`absolute right-1 top-1 z-10 h-2.5 w-2.5 border border-white ${badgeColorClassName}`}
        />
      )}
    </Pressable>
  );
};
