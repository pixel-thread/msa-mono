import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useTrainingModules, useMyTrainingCompletions } from '../hooks';
import { TrainingCard } from '../components';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';
import { Container, StackHeader } from '@src/shared/components';

export const TrainingListScreen = () => {
  const router = useRouter();
  const {
    data: modules,
    isLoading,
    isError,
    refetch,
    isRefetching,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useTrainingModules();

  const { data: completions } = useMyTrainingCompletions();

  const completedModuleIds = new Set(completions?.map((c) => c.moduleId) || []);
  const activeModules = modules?.filter((m) => m.isActive) || [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  if (isLoading)
    return (
      <>
        <StackHeader title="My Training" showDrawerButton showBackButton />
        <LoadingScreen message="Loading training modules..." />
      </>
    );

  if (isError) {
    return (
      <>
        <StackHeader showDrawerButton title="Training" showBackButton />
        <ErrorScreen
          title="Failed to load training"
          message="There was an error loading the training modules. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <Container>
      <StackHeader title="My Training" showDrawerButton showBackButton />
      <FlashList
        data={activeModules}
        renderItem={({ item }) => (
          <TrainingCard
            module={item}
            isCompleted={completedModuleIds.has(item.id)}
            onPress={() => router.push(`/(protected)/training/${item.id}`)}
          />
        )}
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
            title="No training modules found"
            description="There are currently no training modules available. Check back later."
            refresh={refetch}
          />
        }
      />
    </Container>
  );
};
