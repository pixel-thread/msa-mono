import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { usePaymentHistory } from '../hooks/use-payment-history';
import { Text } from '@src/shared/components/ui';
import { TransactionListItem } from './transaction-list-item.component';

export const PaymentHistory = () => {
  const { data, isLoading, isError } = usePaymentHistory();

  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="items-center justify-center py-12">
        <Text variant="subtext" className="text-center">
          Failed to load payment history. Please try again later.
        </Text>
      </View>
    );
  }

  const { transactions, summary } = data;

  return (
    <View className="flex-1">
      {/* Stats Grid */}
      <View className="mb-6 flex-row flex-wrap gap-2">
        {[
          { label: 'Total Paid', value: `${summary.totalPaid}` },
          { label: 'Total Due', value: `${summary.totalDue}` },
          { label: 'Overdue', value: `${summary.overdueMonths} mo` },
          { label: 'Paid', value: `${summary.paidMonths} mo` },
        ].map((stat, idx) => (
          <View
            key={idx}
            className="min-w-[45%] flex-1 border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <Text variant="subtext" size="xs" className="mb-1 uppercase tracking-wider">
              {stat.label}
            </Text>
            <Text variant="heading" size="md" className="text-indigo-600 dark:text-indigo-400">
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Transactions List */}
      <Text variant="heading" size="sm" className="mb-4 text-slate-900 dark:text-white">
        Recent Transactions
      </Text>
      {transactions.length === 0 ? (
        <View className="items-center justify-center border border-dashed border-slate-200 bg-slate-50/50 py-12 dark:border-slate-800 dark:bg-slate-900/30">
          <Text variant="subtext">No transactions found</Text>
        </View>
      ) : (
        transactions.map((t) => <TransactionListItem key={t.id} transaction={t} />)
      )}
    </View>
  );
};
