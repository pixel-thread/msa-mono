import React, { useMemo, useState } from 'react';
import { View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useMyContributions } from '../hooks';
import { Card, CardContent, Text, Button } from '@src/shared/components/ui';
import { cn } from '@src/shared/lib/cn';
import { formatCurrency } from '@src/shared/utils/format';
import { PayContributionButton } from './pay-contribution-button';
import type { ContributionPeriod, ContributionStatus } from '../types';
import { EmptyScreen, LoadingScreen } from '@src/shared/components/screens';

type FilterType = 'ALL' | ContributionStatus;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PAID', label: 'Paid' },
  { key: 'DUE', label: 'Due' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'WAIVED', label: 'Waived' },
];

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

function getStatusBadgeStyle(status: ContributionStatus) {
  switch (status) {
    case 'OVERDUE':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'DUE':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'PAID':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'PARTIAL':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'WAIVED':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
}

function ContributionStatusBadge({ status }: { status: ContributionStatus }) {
  return (
    <View className={cn('self-start rounded-none px-2 py-0.5', getStatusBadgeStyle(status))}>
      <Text size="xs" weight="medium" className="text-inherit">
        {status}
      </Text>
    </View>
  );
}

function ContributionRow({ item }: { item: ContributionPeriod }) {
  const monthLabel = MONTHS[item.month - 1] ?? `Month ${item.month}`;
  const dueDate = new Date(item.dueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

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
}

export const MyContributions = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const page = 1;

  const { data, isLoading, isError, refetch, isRefetching } = useMyContributions(
    activeFilter,
    page
  );

  const { summary } = useMemo(() => {
    const overdueItems = data.filter((i) => i.status === 'OVERDUE');
    const dueItems = data.filter((i) => i.status === 'DUE');
    const pendingItems = data.filter((i) => i.status === 'PENDING');
    const paidItems = data.filter((i) => i.status === 'PAID' || i.status === 'PARTIAL');
    const waivedItems = data.filter((i) => i.status === 'WAIVED');

    return {
      summary: {
        totalExpected: data.reduce((s, i) => s + i.expectedAmount, 0),
        totalPaid: paidItems.reduce((s, i) => s + i.paidAmount, 0),
        overdueAmount: overdueItems.reduce((s, i) => s + i.dueAmount, 0),
        pendingCount: pendingItems.length,
        waivedTotal: waivedItems.reduce((s, i) => s + i.expectedAmount, 0),
        dueTotal: dueItems.reduce((s, i) => s + i.expectedAmount, 0),
      },
    };
  }, [data]);

  const summaryCards = [
    {
      label: 'Total Expected',
      value: formatCurrency(summary.totalExpected),
      color: 'text-indigo-600',
    },
    {
      label: 'Total Paid',
      value: formatCurrency(summary.totalPaid),
      color: 'text-green-600',
    },
    {
      label: 'Overdue',
      value: `${summary.overdueAmount} (${formatCurrency(summary.overdueAmount)})`,
      color: 'text-amber-600',
    },
    {
      label: 'Pending',
      value: String(summary.pendingCount),
      color: 'text-slate-600',
    },
    {
      label: 'Waived',
      value: formatCurrency(summary.waivedTotal),
      color: 'text-slate-400',
    },
  ];

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return (
      <EmptyScreen
        icon="alert-circle-outline"
        refresh={refetch}
        title="Failed to load contributions"
        description="Failed to load contributions. Please try again later."
      />
    );
  }

  if (data.length === 0) {
    return (
      <>
        <View className="mb-4 flex-row flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const active = activeFilter === filter.key;
            return (
              <Button
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                size={'sm'}
                variant={active ? 'default' : 'outline'}>
                <Text
                  size="sm"
                  weight="medium"
                  className={active ? 'text-white' : 'text-slate-600 dark:text-slate-400'}>
                  {filter.label}
                </Text>
              </Button>
            );
          })}
        </View>
        <EmptyScreen
          icon="alert-circle-outline"
          refresh={refetch}
          title="No contributions found"
          description="No contributions found. Please try again later."
        />
      </>
    );
  }
  return (
    <View className="flex-1">
      <View className="mb-4 flex-row flex-wrap gap-2">
        {summaryCards.map((stat, idx) => (
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

      <View className="mb-4 flex-row flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <Button
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              size={'sm'}
              variant={active ? 'default' : 'outline'}>
              <Text
                size="sm"
                weight="medium"
                className={active ? 'text-white' : 'text-slate-600 dark:text-slate-400'}>
                {filter.label}
              </Text>
            </Button>
          );
        })}
      </View>

      <FlashList
        data={data}
        renderItem={({ item }) => <ContributionRow item={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
      />
    </View>
  );
};
