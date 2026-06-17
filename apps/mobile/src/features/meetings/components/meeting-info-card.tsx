import { Ionicons } from '@expo/vector-icons';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { cn } from '@lib/cn';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';

export const MeetingInfoCard = ({
  icon,
  label,
  value,
  className,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  className?: string;
}) => {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <Card
      className={cn(
        'border-slate-100 bg-white shadow-none dark:border-slate-700 dark:bg-slate-900',
        className
      )}>
      <CardContent className="flex-row items-center justify-center gap-x-3 p-4">
        <Ionicons name={icon} size={16} color={iconColor} />
        <View className="flex-1">
          <Text variant="label" size="xs" className="uppercase tracking-widest">
            {label}
          </Text>
          <Text
            weight="bold"
            size="sm"
            className="mt-0.5 text-slate-900 dark:text-white"
            selectable>
            {value}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};
