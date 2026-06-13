import React, { useState } from 'react';
import { View, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Transaction } from '../types/payment';
import { Text } from '@src/shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { formattedDate } from '@src/shared/utils/format';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  transaction: Transaction;
}

export const TransactionListItem = ({ transaction }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600';
      case 'PENDING':
        return 'text-amber-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleExpand}
      className="mb-3 border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50"
      activeOpacity={0.7}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text variant="subtext" size="xs" className="mb-1">
            {formattedDate(new Date(transaction.paymentDate))}
          </Text>
          <Text variant="heading" size="sm">
            {transaction.amount} {transaction.currency}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text
            variant="subtext"
            size="xs"
            className={`${getStatusColor(transaction.status)} font-bold`}>
            {transaction.status}
          </Text>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#94a3b8" />
        </View>
      </View>

      {isExpanded && (
        <View className="mt-4 border-t border-slate-50 pt-4 dark:border-slate-800">
          <View className="mb-2 flex-row justify-between">
            <Text variant="subtext" size="xs">
              Created By
            </Text>
            <Text variant="subtext" size="xs" className="text-slate-900 dark:text-white">
              {transaction.createdById || 'System'}
            </Text>
          </View>

          <Text variant="subtext" size="xs" className="mb-2 font-bold">
            Allocations
          </Text>
          {transaction.allocations.map((allocation, idx) => (
            <View key={idx} className="mb-1 ml-2 flex-row justify-between">
              <Text variant="subtext" size="xs">
                {allocation.contributionPeriod.month}/{allocation.contributionPeriod.year}
              </Text>
              <Text variant="subtext" size="xs" className="text-slate-900 dark:text-white">
                {allocation.allocatedAmount} {transaction.currency}
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};
