import React, { useCallback } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { usePaymentHistory } from '../hooks/use-payment-history';
import { Text } from '@src/shared/components/ui';
import { TransactionListItem } from './transaction-list-item.component';
import type { Transaction } from '../types/payment';
import { EmptyScreen, LoadingScreen } from '@src/shared/components/screens';

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <View className="min-w-[45%] flex-1 border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
    <Text variant="subtext" size="xs" className="mb-1 uppercase tracking-wider">
      {label}
    </Text>
    <Text variant="heading" size="lg" className="text-indigo-600 dark:text-indigo-400">
      {value}
    </Text>
  </View>
);

export const PaymentHistory = () => {
  const {
    data,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    isFetching,
    fetchNextPage,
    isError,
    refetch,
  } = usePaymentHistory();

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => <TransactionListItem transaction={item} />,
    []
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  if (isLoading) {
    return <LoadingScreen description="Loading payment history..." />;
  }

  if (isError) {
    return (
      <EmptyScreen
        title="Error loading payment history"
        description="Please try again later"
        refresh={refetch}
      />
    );
  }

  if (!data) {
    return (
      <>
        <View className="pb-6">
          <View className="mb-6 flex-row flex-wrap gap-2">
            <StatCard label="Total Paid" value={'0'} />
            <StatCard label="Total Due" value={`0`} />
            <StatCard label="Overdue" value={`0 m`} />
            <StatCard label="Paid" value={`0 mo`} />
          </View>
          <Text variant="heading" size="sm" className="text-slate-900 dark:text-white">
            Recent Transactions
          </Text>
        </View>
        <EmptyScreen
          title="No payment history found"
          description="Please try again later"
          refresh={refetch}
        />
      </>
    );
  }

  const { transactions, summary } = data;

  const ListHeader = (
    <View className="pb-6">
      <View className="mb-6 flex-row flex-wrap gap-2">
        <StatCard label="Total Paid" value={`${summary.totalPaid}`} />
        <StatCard label="Total Due" value={`${summary.totalDue}`} />
        <StatCard label="Overdue" value={`${summary.overdueMonths} mo`} />
        <StatCard label="Paid" value={`${summary.paidMonths} mo`} />
      </View>
      <Text variant="heading" size="sm" className="text-slate-900 dark:text-white">
        Recent Transactions
      </Text>
    </View>
  );

  return (
    <FlashList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshing={isRefetching}
      ListEmptyComponent={
        <EmptyScreen
          title="No payment history found"
          description="Please try again later"
          refresh={refetch}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
    />
  );
};
