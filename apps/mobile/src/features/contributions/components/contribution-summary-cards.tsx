import React from 'react';
import { View } from 'react-native';
import { Text } from '@src/shared/components/ui';
import { formatCurrency } from '@src/shared/utils/format';
import { ContributionOverview } from '../types';

interface ContributionSummaryCardsProps {
  summary: ContributionOverview | undefined | null;
}

export const ContributionSummaryCards = ({ summary }: ContributionSummaryCardsProps) => {
  const cards = [
    {
      label: 'Total Expected',
      value: formatCurrency(summary?.totalExpected || 0),
      color: 'text-indigo-600',
    },
    {
      label: 'Total Paid',
      value: formatCurrency(summary?.totalPaid || 0),
      color: 'text-green-600',
    },
    {
      label: 'Total Partial',
      value: formatCurrency(summary?.totalPartial || 0),
      color: 'text-green-600',
    },
    {
      label: 'Overdue',
      value: `${summary?.overdueCount} (${formatCurrency(summary?.overdueAmount || 0)})`,
      color: 'text-amber-600',
    },
    {
      label: 'Pending',
      value: String(summary?.pendingCount),
      color: 'text-slate-600',
    },
    {
      label: 'Waived',
      value: formatCurrency(summary?.waivedTotal || 0),
      color: 'text-slate-400',
    },
  ];

  return (
    <View className="mb-4 flex-row flex-wrap gap-2">
      {cards.map((stat, idx) => (
        <View
          key={idx}
          className="min-w-[45%] flex-1 border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
          <Text variant="subtext" size="xs" className="mb-1 uppercase tracking-wider">
            {stat.label}
          </Text>
          <Text variant="heading" size="default" className={stat.color}>
            {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
};
