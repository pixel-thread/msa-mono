import React from 'react';
import { View } from 'react-native';
import { Text, Button } from '@src/shared/components/ui';
import type { ContributionStatus } from '../types';

type FilterType = 'ALL' | ContributionStatus;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'DUE', label: 'Due' },
  { key: 'OVERDUE', label: 'OverDue' },
  { key: 'PAID', label: 'Paid' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'WAIVED', label: 'Waived' },
];

interface ContributionFilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export { FilterType };

export const ContributionFilterBar = ({
  activeFilter,
  onFilterChange,
}: ContributionFilterBarProps) => {
  return (
    <View className="mb-4 flex-row flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = activeFilter === filter.key;
        return (
          <Button
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            size="sm"
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
  );
};
