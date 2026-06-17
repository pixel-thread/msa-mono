import { Ionicons } from '@expo/vector-icons';
import { Text } from '@src/shared/components/ui';
import { cn } from '@src/shared/lib/cn';
import { ComponentProps } from 'react';
import { TouchableOpacity, View } from 'react-native';

export const DashboardBentoCard = ({
  icon,
  title,
  subtitle,
  onPress,
  color,
  iconColor,
  textColor,
  className,
  iconSize = 28,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  onPress: () => void;
  color: string;
  iconColor: string;
  textColor: string;
  className?: string;
  iconSize?: number;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} className={cn('flex-1', className)}>
    <View className={cn('p-6 shadow-sm', color, className)}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
      <View className="mt-4">
        <Text weight="bold" size="lg" className={textColor}>
          {title}
        </Text>
        {subtitle && (
          <Text weight="medium" size="xs" className={cn('mt-1 opacity-80', textColor)}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);
