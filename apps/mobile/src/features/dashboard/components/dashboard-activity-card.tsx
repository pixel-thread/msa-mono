import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { cn } from '@src/shared/lib/cn';
import { ComponentProps } from 'react';
import { View } from 'react-native';

export const DashboardActivityCard = ({
  icon,
  title,
  description,
  color,
  iconColor,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  color: string;
  iconColor: string;
}) => (
  <Card className="border-0 bg-white shadow-sm dark:bg-slate-900">
    <CardContent className="flex-row items-center gap-4 p-4">
      <View className={cn('h-12 w-12 items-center justify-center ', color)}>
        <Ionicons name={icon} size={24} className={iconColor} />
      </View>
      <View className="flex-1">
        <Text weight="bold" size="sm" className="text-slate-900 dark:text-white" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="subtext" size="xs" className="mt-0.5" numberOfLines={2}>
          {description}
        </Text>
      </View>
    </CardContent>
  </Card>
);
