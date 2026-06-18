import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useAnnouncements } from '../hooks';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';
import { AnnouncementCard } from '../components';
import { Container, StackHeader } from '@src/shared/components';

export const AnnouncementListScreen = () => {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useAnnouncements();

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  if (isLoading)
    return (
      <>
        <StackHeader showBackButton title="Announcements" />
        <LoadingScreen message="Fetching announcements..." />
      </>
    );

  if (isError) {
    return (
      <>
        <StackHeader showBackButton title="Announcements" />
        <ErrorScreen
          title="Failed to load announcements"
          message="There was an error retrieving the announcements. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <Container>
      <StackHeader title="Announcements" showBackButton={true} />
      <FlashList
        data={data}
        renderItem={({ item }) => <AnnouncementCard announcement={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 pt-4"
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        refreshing={isRefetching}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          <EmptyScreen
            title="No announcements"
            description="There are no announcements available."
            icon={'notifications'}
          />
        }
      />
    </Container>
  );
};
