import React, { useCallback } from 'react';
import { RefreshControl, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useMeetings } from '../hooks';
import { ErrorScreen, EmptyScreen, LoadingScreen } from '@src/shared/components/screens';
import { MeetingCard } from '../components';
import { Container, StackHeader } from '@src/shared/components';

/**
 * Main screen for displaying the list of meetings.
 */
export const MeetingListScreen = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isFetching,
  } = useMeetings();

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  if (isLoading) {
    return (
      <>
        <StackHeader title="Meetings" showBackButton={false} showDrawerButton />
        <LoadingScreen message="Loading meetings..." />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StackHeader title="Meetings" showBackButton={false} showDrawerButton />
        <ErrorScreen
          title="Failed to load meetings"
          message="There was an error retrieving the meeting list. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <>
      <StackHeader title="Meetings" showBackButton={false} showDrawerButton />
      <Container>
        <FlashList
          data={data?.meetings}
          renderItem={({ item }) => item && <MeetingCard meeting={item} />}
          keyExtractor={(item) => item.id.toString()}
          accessibilityLabel="Meetings list"
          contentContainerClassName="p-4"
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
              title="No meetings yet"
              description="When meetings are scheduled, they'll appear here."
              icon="calendar-clear-outline"
              refresh={() => refetch()}
            />
          }
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        />
      </Container>
    </>
  );
};
