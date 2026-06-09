import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui';
import type { DeclarationStatus } from '../types';
import { cn } from '@src/shared/lib/cn';

interface DeclarationStatusBadgeProps {
  status: DeclarationStatus;
}

const getDeclarationStatusColor = (status: DeclarationStatus) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-50';
    case 'APPROVED':
      return 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-50';
    case 'REJECTED':
      return 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-50';
    default:
      return 'bg-slate-50 dark:bg-slate-900/20 text-slate-900 dark:text-slate-50';
  }
};

export const DeclarationStatusBadge = ({ status }: DeclarationStatusBadgeProps) => {
  return (
    <View className={cn(`self-start rounded px-2 py-0.5`, getDeclarationStatusColor(status))}>
      <Text
        size="xs"
        weight="medium"
        className={cn('capitalize', getDeclarationStatusColor(status))}>
        {status}
      </Text>
    </View>
  );
};
