import React, { useCallback } from 'react';
import { View, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useMyTrainingCompletions } from '../hooks';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';
import { Container, StackHeader } from '@src/shared/components';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import type { TrainingCompletionWithModule } from '../types';
import { formattedDate } from '@src/shared/utils';

interface CompletionCardProps {
  completion: TrainingCompletionWithModule;
}

const CompletionCard: React.FC<CompletionCardProps> = ({ completion }) => (
  <View className="mb-4">
    <Card className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
      <CardContent className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="mb-2 flex-row items-center gap-x-2">
              <View className="bg-emerald-50 px-2 py-0.5 dark:bg-emerald-900/20">
                <Text
                  variant="label"
                  size="xs"
                  className="font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                  COMPLETED
                </Text>
              </View>
            </View>

            <Text
              weight="semibold"
              variant="heading"
              size="sm"
              className="mb-2 text-slate-900 dark:text-white">
              {completion.module.title}
            </Text>

            {completion.module.description && (
              <Text
                variant="subtext"
                size="xs"
                numberOfLines={2}
                className="mb-2 text-slate-600 dark:text-slate-400">
                {completion.module.description}
              </Text>
            )}

            <View className="flex-row items-center gap-x-4">
              <View className="flex-row items-center gap-x-1">
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text size="xs" className="text-slate-500 dark:text-slate-400">
                  {formattedDate(new Date(completion.completedAt))}
                </Text>
              </View>

              {completion.scorePercent !== null && (
                <View className="flex-row items-center gap-x-1">
                  <Ionicons name="stats-chart-outline" size={14} color="#64748b" />
                  <Text size="xs" className="text-slate-500 dark:text-slate-400">
                    Score: {completion.scorePercent}%
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="items-end">
            <View className="h-10 w-10 items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
            </View>
          </View>
        </View>
      </CardContent>
      {completion.certificateUrl && (
        <TouchableOpacity
          onPress={() => Linking.openURL(completion.certificateUrl!)}
          className="flex-row items-center justify-center gap-x-2 border-t border-slate-100 bg-primary p-3">
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text weight="semibold" size="sm" className="text-primary-foreground">
            Certificate
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  </View>
);

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
        refreshing={isRefetching}
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
