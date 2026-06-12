import React from 'react';
import { View, RefreshControl, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrainingModules, useMyTrainingCompletions } from '../hooks';
import { LoadingScreen, ErrorScreen } from '@src/shared/components/screens';
import { Container, StackHeader } from '@src/shared/components';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { cn } from '@lib/cn';
import type { TrainingModule } from '../types';

interface TrainingCardProps {
  module: TrainingModule;
  isCompleted: boolean;
  onPress: () => void;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ module, isCompleted, onPress }) => (
  <View className="mb-4">
    <Card className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="mb-2 flex-row items-center gap-x-2">
                <View
                  className={cn(
                    'px-2 py-0.5',
                    isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'bg-indigo-50 dark:bg-indigo-900/20'
                  )}>
                  <Text
                    variant="label"
                    size="xs"
                    className={cn(
                      'font-bold tracking-wider',
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-indigo-600 dark:text-indigo-400'
                    )}>
                    {isCompleted ? 'COMPLETED' : 'REQUIRED'}
                  </Text>
                </View>
              </View>

              <Text
                weight={'semibold'}
                variant="heading"
                size="sm"
                className="mb-2 text-slate-900 dark:text-white">
                {module.title}
              </Text>

              {module.description && (
                <Text
                  variant="subtext"
                  size="xs"
                  numberOfLines={2}
                  className="text-slate-600 dark:text-slate-400">
                  {module.description}
                </Text>
              )}
            </View>

            <View className="items-end justify-between self-stretch">
              <View className="h-10 w-10 items-center justify-center bg-slate-50 dark:bg-slate-800">
                <Ionicons
                  name={isCompleted ? 'checkmark-circle' : 'chevron-forward'}
                  size={18}
                  color={isCompleted ? '#16a34a' : '#94a3b8'}
                />
              </View>
              <View className="mt-4 flex-row flex-wrap justify-end gap-1">
                {module.requiredForRoles.slice(0, 2).map((role) => (
                  <View key={role} className="bg-slate-50 px-2 py-0.5 dark:bg-slate-800">
                    <Text size="xs" weight="medium" className="text-slate-600 dark:text-slate-400">
                      {role.replace('_', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </CardContent>
      </TouchableOpacity>
    </Card>
  </View>
);

export const TrainingListScreen = () => {
  const router = useRouter();
  const { data: modules, isLoading, isError, refetch, isRefetching } = useTrainingModules();
  const { data: completions } = useMyTrainingCompletions();

  const completedModuleIds = new Set(completions?.map((c) => c.moduleId) || []);

  const activeModules = modules?.filter((m) => m.isActive) || [];

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
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-24">
            <View className="mb-6 h-20 w-20 items-center justify-center bg-slate-100 dark:bg-slate-900">
              <Ionicons name="school-outline" size={32} color="#64748b" />
            </View>
            <Text variant="heading" size="lg" className="text-slate-900 dark:text-white">
              No training available
            </Text>
            <Text variant="subtext" size="sm" className="mt-2 text-center">
              Check back later for new training modules.
            </Text>
          </View>
        }
      />
    </Container>
  );
};
