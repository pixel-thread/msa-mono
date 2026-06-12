import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useMyContributions } from '../hooks';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { cn } from '@src/shared/lib/cn';
import { formatCurrency } from '@src/shared/utils/format';
import type { ContributionPeriod, ContributionStatus } from '../types';

type FilterType = 'all' | 'paid' | 'due' | 'pending';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'due', label: 'Due' },
  { key: 'pending', label: 'Pending' },
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
    case 'PAID':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'DUE':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'PARTIAL':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'WAIVED':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
}

function ContributionStatusBadge({ status }: { status: ContributionStatus }) {
  return (
    <View className={cn('self-start rounded px-2 py-0.5', getStatusBadgeStyle(status))}>
      <Text size="xs" weight="medium">
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
            <ContributionStatusBadge status={item.status} />
          </View>
        </CardContent>
      </Card>
    </View>
  );
}

export const MyContributions = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { data, isLoading, isError, refetch, isRefetching } = useMyContributions(
    activeFilter === 'due' || activeFilter === 'pending' ? 'DUE' : undefined
  );

  const { filteredData, summary } = useMemo(() => {
    const now = new Date();
    const filtered = data.filter((item) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'paid') return item.status === 'PAID' || item.status === 'PARTIAL';
      if (activeFilter === 'due') return item.status === 'DUE' && new Date(item.dueDate) <= now;
      if (activeFilter === 'pending') return item.status === 'DUE' && new Date(item.dueDate) > now;
      return true;
    });

    const totalPaid = data
      .filter((i) => i.status === 'PAID' || i.status === 'PARTIAL')
      .reduce((s, i) => s + i.paidAmount, 0);
    const totalDue = data
      .filter((i) => i.status === 'DUE' && new Date(i.dueDate) <= now)
      .reduce((s, i) => s + i.dueAmount, 0);
    const pendingCount = data.filter((i) => i.status === 'DUE' && new Date(i.dueDate) > now).length;
    const waivedTotal = data
      .filter((i) => i.status === 'WAIVED')
      .reduce((s, i) => s + i.expectedAmount, 0);

    return {
      filteredData: filtered,
      summary: { totalPaid, totalDue, pendingCount, waivedTotal },
    };
  }, [data, activeFilter]);

  if (isLoading) {
    return (
      <View className="items-center justify-center py-12" testID="contributions-loading">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="items-center justify-center py-12">
        <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
        <Text variant="subtext" className="mt-3 text-center">
          Failed to load contributions.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-4 rounded bg-indigo-600 px-6 py-2">
          <Text className="font-medium text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Summary Cards */}
      <View className="mb-4 flex-row flex-wrap gap-2">
        {[
          {
            label: 'Total Paid',
            value: formatCurrency(summary.totalPaid),
            color: 'text-green-600',
          },
          { label: 'Total Due', value: formatCurrency(summary.totalDue), color: 'text-amber-600' },
          { label: 'Pending', value: String(summary.pendingCount), color: 'text-slate-600' },
          { label: 'Waived', value: formatCurrency(summary.waivedTotal), color: 'text-slate-400' },
        ].map((stat, idx) => (
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

      {/* Filter Chips */}
      <View className="mb-4 flex-row gap-2">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              className={cn(
                'rounded-full px-4 py-2',
                active
                  ? 'bg-indigo-600'
                  : 'border border-slate-200 bg-transparent dark:border-slate-700'
              )}>
              <Text
                size="sm"
                weight="medium"
                className={active ? 'text-white' : 'text-slate-600 dark:text-slate-400'}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {filteredData.length === 0 ? (
        <View className="items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 py-12 dark:border-slate-800 dark:bg-slate-900/30">
          <Ionicons name="receipt-outline" size={40} color="#94a3b8" />
          <Text variant="subtext" className="mt-2">
            No contributions found
          </Text>
        </View>
      ) : (
        <FlashList
          data={filteredData}
          renderItem={({ item }) => <ContributionRow item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
          }
        />
      )}
    </View>
  );
};
