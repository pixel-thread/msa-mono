import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui';
import { cn } from '@lib/cn';

type BadgeVariant = 'completed' | 'required' | 'pending' | 'default';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  completed: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  required: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  pending: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400',
  default: 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400',
};

export const StatusBadge = ({ variant, label }: StatusBadgeProps) => (
  <View className={cn('px-2 py-0.5', variantStyles[variant])}>
    <Text
      variant="label"
      size="xs"
      className={cn('font-bold tracking-wider', variantStyles[variant])}>
      {label}
    </Text>
  </View>
);
