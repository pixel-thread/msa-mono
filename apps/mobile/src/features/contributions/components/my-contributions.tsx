import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useMyContributions } from '../hooks';
import { ContributionRow } from './contribution-row';
import { ContributionFilterBar, type FilterType } from './contribution-filter-bar';
import { EmptyScreen } from '@src/shared/components/screens';
import { ContributionSummaryCards } from './contribution-summary-cards';
import { Container } from '@src/shared/components';

export const MyContributions = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const {
    data,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    summary,
    isError,
    refetch,
  } = useMyContributions(activeFilter);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

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
    <Container className="flex-1 px-4">
      <FlashList
        data={data}
        renderItem={({ item }) => <ContributionRow item={item} />}
        accessibilityLabel="Contributions list"
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <>
            <ContributionSummaryCards summary={summary} />
            <ContributionFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </>
        }
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          isFetching ? null : (
            <EmptyScreen
              icon="alert-circle-outline"
              refresh={refetch}
              title="No contributions found"
              description="No contributions found. Please try again later."
            />
          )
        }
      />
    </Container>
  );
};
