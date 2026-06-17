import React, { useCallback } from 'react';
import { View, ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useConsentHistory } from '@src/features/consent/hooks';
import { ConsentHistoryItem } from '@src/features/consent/components';
import { Container, StackHeader } from '@src/shared/components';
import { ErrorScreen, EmptyScreen } from '@src/shared/components/screens';

export function ConsentHistoryScreen() {
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
  } = useConsentHistory();

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  if (isLoading) {
    return (
      <>
        <StackHeader title="Consent History" showBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StackHeader title="Consent History" showBackButton />
        <ErrorScreen
          title="Failed to load consent history"
          message="There was an error retrieving your consent audit history. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <>
      <StackHeader title="Consent History" showBackButton />
      <Container>
        <FlashList
          data={data?.receipts}
          renderItem={({ item }) => <ConsentHistoryItem receipt={item} />}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4"
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
          refreshing={isRefetching}
          onRefresh={refetch}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#4f46e5" />
          }
          ListEmptyComponent={
            <EmptyScreen
              title="No consent history yet"
              description="When you update your consent preferences, the changes will appear here."
              refresh={() => refetch()}
            />
          }
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        />
      </Container>
    </>
  );
}
