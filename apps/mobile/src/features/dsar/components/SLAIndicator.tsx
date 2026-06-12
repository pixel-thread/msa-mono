import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui/text';
import { getSLAStatus, getSLAColor } from '../utils/sla.utils';
import { cn } from '@src/shared/lib/cn';

interface Props {
  createdAt: string | Date;
  className?: string;
}

export const SLAIndicator = ({ createdAt, className }: Props) => {
  const status = getSLAStatus(createdAt);
  const color = getSLAColor(status);

  return (
    <View className={cn('flex-row items-center gap-1.5', className)}>
      <View style={{ backgroundColor: color }} className="h-2.5 w-2.5 " />
      <Text className="text-xs font-medium text-gray-600">{status.replace('_', ' ')}</Text>
    </View>
  );
};
