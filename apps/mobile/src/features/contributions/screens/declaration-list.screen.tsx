import React, { useCallback } from 'react';
import { RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDeclarations } from '../hooks';
import { DeclarationCard } from '../components';
import { Container, StackHeader } from '@src/shared/components';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';

export const DeclarationListScreen = () => {
  const router = useRouter();
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
  } = useDeclarations();

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  if (isLoading) {
    return (
      <>
        <StackHeader showBackButton title="Declarations" />
        <LoadingScreen description="Loading declarations" />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StackHeader showBackButton title="Declarations" />
        <ErrorScreen
          title="Failed to load declarations"
          message="There was an error retrieving declarations. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <Container>
      <StackHeader
        title="Declarations"
        showBackButton
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/(protected)/declarations/create')}
            activeOpacity={0.7}>
            <Ionicons name="add" size={24} color="#6366f1" />
          </TouchableOpacity>
        }
      />
      <FlashList
        data={data?.declarations}
        renderItem={({ item }) => <DeclarationCard declaration={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        ListEmptyComponent={
          <EmptyScreen
            title="No declarations"
            description="Tap the + button to create your first declaration."
            refresh={refetch}
          />
        }
      />
    </Container>
  );
};
