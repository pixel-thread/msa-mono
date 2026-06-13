import React from 'react';
import { View } from 'react-native';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { formatCurrency, formatDate } from '@src/shared/utils/format';
import { ContributionStatusBadge } from './contribution-status-badge';
import { PayContributionButton } from './pay-contribution-button';
import type { ContributionPeriod } from '../types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface ContributionRowProps {
  item: ContributionPeriod;
}

export const ContributionRow = ({ item }: ContributionRowProps) => {
  const monthLabel = MONTHS[item.month - 1] ?? `Month ${item.month}`;

  const dueDate = formatDate(item.dueDate);

  return (
    <View className="mb-3">
      <Card className="overflow-hidden border-slate-100 dark:border-slate-800">
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text weight="semibold" size="default" className="text-slate-900 dark:text-white">
                {monthLabel} {item.year}
              </Text>
              <Text variant="subtext" size="xs" className="mt-1">
                Due: {dueDate}
              </Text>
              <View className="mt-2 flex-row items-center gap-x-3">
                <Text weight="bold" size="lg" className="text-slate-900 dark:text-white">
                  {formatCurrency(item.expectedAmount)}
                </Text>
                {item.paidAmount > 0 && (
                  <Text size="sm" variant="subtext">
                    Paid: {formatCurrency(item.paidAmount)}
                  </Text>
                )}
              </View>
            </View>
            <View className="items-end gap-y-2">
              <ContributionStatusBadge status={item.status} />
              <PayContributionButton
                contributionPeriodId={item.id}
                expectedAmount={item.expectedAmount}
                dueAmount={item.dueAmount}
                status={item.status}
              />
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
};
