import React, { useState } from 'react';
import { View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useMyContributions } from '../hooks';
import { ContributionRow } from './contribution-row';
import { ContributionSummaryCards } from './contribution-summary-cards';
import { ContributionFilterBar } from './contribution-filter-bar';
import type { FilterType } from './contribution-filter-bar';
import { EmptyScreen, LoadingScreen } from '@src/shared/components/screens';

export const MyContributions = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const page = 1;

  const { data, summary, isLoading, isError, refetch, isRefetching } = useMyContributions(
    activeFilter,
    page
  );

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
        {summary && <ContributionSummaryCards summary={summary} />}
        <ContributionFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
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
      {summary && <ContributionSummaryCards summary={summary} />}
      <ContributionFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
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
