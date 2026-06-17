import React, { useCallback, useState } from 'react';
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

  const {
    data,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    summary,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMyContributions(activeFilter, page);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

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

  return (
    <View className="flex-1">
      <ContributionSummaryCards summary={summary} />
      <ContributionFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <FlashList
        data={data}
        renderItem={({ item }) => <ContributionRow item={item} />}
        accessibilityLabel="Contributions list"
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        refreshing={isRefetching}
        onRefresh={refetch}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          <EmptyScreen
            icon="alert-circle-outline"
            refresh={refetch}
            title="No contributions found"
            description="No contributions found. Please try again later."
          />
        }
      />
    </View>
  );
};
