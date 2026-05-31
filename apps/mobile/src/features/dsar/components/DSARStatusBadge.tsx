import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui/text';
import { DSARStatus } from '../types/dsar.types';
import { cn } from '@src/shared/lib/cn';

interface Props {
  status: DSARStatus;
  className?: string;
}

export const DSARStatusBadge = ({ status, className }: Props) => {
  const getStyles = () => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLabel = () => {
    return status.replace('_', ' ');
  };

  return (
    <View className={cn('px-2 py-0.5 border items-center justify-center', getStyles().split(' ').filter(s => s.startsWith('bg-') || s.startsWith('border-')).join(' '), className)}>
      <Text className={cn('text-[10px] font-bold uppercase', getStyles().split(' ').filter(s => s.startsWith('text-')).join(' '))}>{getLabel()}</Text>
    </View>
  );
};
