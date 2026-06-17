import React, { useState, useCallback, useMemo } from 'react';
import { View, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDeclarations } from '../hooks';
import { DeclarationCard } from '../components';
import { Container, StackHeader } from '@src/shared/components';
import { Text } from '@src/shared/components/ui';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';
import type { DeclarationStatus } from '../types';

type DeclarationFilter = 'ALL' | DeclarationStatus;

const FILTERS: DeclarationFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

export const DeclarationListScreen = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<DeclarationFilter>('ALL');
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
  } = useDeclarations({ status: activeFilter });

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

      <View className="flex-row border-b border-slate-100 px-6 dark:border-slate-800">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className="flex-1 py-4">
              <Text
                className={`text-center text-base font-semibold ${
                  active
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </Text>
              {active && (
                <View className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

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
            title={`No ${activeFilter === 'ALL' ? '' : activeFilter.toLowerCase() + ' '}declarations`}
            description={
              activeFilter === 'ALL'
                ? 'Tap the + button to create your first declaration.'
                : `No declarations with status "${activeFilter.toLowerCase()}".`
            }
            refresh={refetch}
          />
        }
      />
    </Container>
  );
};
