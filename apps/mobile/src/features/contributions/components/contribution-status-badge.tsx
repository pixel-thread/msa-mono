import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui';
import { cn } from '@src/shared/lib/cn';
import type { ContributionStatus } from '../types';

function getStatusBadgeStyle(status: ContributionStatus) {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'DUE':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'PARTIAL':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'WAIVED':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
}

interface ContributionStatusBadgeProps {
  status: ContributionStatus;
}

export const ContributionStatusBadge = ({ status }: ContributionStatusBadgeProps) => {
  return (
    <View className={cn('self-start rounded-none px-2 py-0.5', getStatusBadgeStyle(status))}>
      <Text size="xs" weight="medium" className="text-inherit">
        {status}
      </Text>
    </View>
  );
};
