import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useMyTrainingCompletions } from '../hooks';
import { CompletionCard } from '../components';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';
import { Container, StackHeader } from '@src/shared/components';

export const TrainingCompletionsScreen = () => {
  const {
    data: completions,
    isLoading,
    isError,
    refetch,
    isRefetching,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useMyTrainingCompletions();

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  if (isLoading)
    return (
      <>
        <StackHeader title="Training Completions" showDrawerButton showBackButton />
        <LoadingScreen message="Loading training completions..." />
      </>
    );

  if (isError) {
    return (
      <>
        <StackHeader showDrawerButton title="Training Completions" showBackButton />
        <ErrorScreen
          title="Failed to load completions"
          message="There was an error loading your training completions. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <Container>
      <StackHeader title="Training Completions" showDrawerButton showBackButton />
      <FlashList
        data={completions}
        renderItem={({ item }) => <CompletionCard completion={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          <EmptyScreen
            title="No completions found"
            description="You have not completed any training modules yet."
            refresh={refetch}
          />
        }
      />
    </Container>
  );
};
