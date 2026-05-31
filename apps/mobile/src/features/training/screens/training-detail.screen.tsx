import React from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrainingModule, useMyTrainingCompletions } from '../hooks';
import { TrainingSupplements } from '../components/training-supplements';
import { LoadingScreen, ErrorScreen } from '@src/shared/components/screens';
import { Container, StackHeader } from '@src/shared/components';
import { Text } from '@src/shared/components/ui';
import { formattedDate } from '@utils/format';
import { cn } from '@lib/cn';

export const TrainingDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: module, isLoading, isError, refetch } = useTrainingModule(id || '');
  const { data: completions } = useMyTrainingCompletions();

  const isCompleted = completions?.some((c) => c.moduleId === id) || false;

  const content = React.useMemo(() => {
    try {
      if (!module) return;
      return JSON.parse(module?.content);
    } catch {
      if (!module) return;
      return module.content;
    }
  }, [module?.content]);

  if (isLoading)
    return (
      <>
        <StackHeader showBackButton title="Training Details" />
        <LoadingScreen message="Loading training module..." />
      </>
    );

  if (isError || !module) {
    return (
      <>
        <StackHeader showBackButton title="Training" />
        <ErrorScreen
          title="Failed to load training"
          message="There was an error loading this training module. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <Container>
      <StackHeader showBackButton title="Training Details" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="px-4 pb-8 pt-6">
          <View className="mb-4 flex-row flex-wrap items-center gap-2">
            {module.requiredForRoles.map((role) => (
              <View key={role} className="bg-indigo-600 px-2 py-0.5">
                <Text weight="bold" size="xs" className="uppercase tracking-widest text-white">
                  {role.replace('_', ' ')}
                </Text>
              </View>
            ))}

            <View
              className={cn(
                'px-2 py-0.5',
                isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-950/20'
                  : 'bg-amber-50 dark:bg-amber-950/20'
              )}>
              <Text
                size="xs"
                weight="medium"
                className={cn(
                  'text-[10px] uppercase tracking-widest',
                  isCompleted
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                )}>
                {isCompleted ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>

          <Text
            variant="heading"
            size="3xl"
            className="leading-tight text-slate-900 dark:text-white">
            {module.title}
          </Text>

          {module.description && (
            <Text variant="subtext" size="sm" className="mt-3 leading-relaxed">
              {module.description}
            </Text>
          )}

          <View className="mt-4 flex-row items-center gap-x-2">
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text variant="subtext" size="xs" className="text-slate-500">
              Last updated {formattedDate(new Date(module.updatedAt))}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View className="px-4 pb-8">
          <Text variant="heading" size="lg" className="mb-4 px-1 text-slate-900 dark:text-white">
            Module Content
          </Text>
          <View className="border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {typeof content === 'string' ? (
              <Text className="leading-relaxed text-slate-700 dark:text-slate-300">{content}</Text>
            ) : (
              <View className="gap-y-6">
                {content.sections?.map(
                  (section: { title: string; content: string }, index: number) => (
                    <View
                      key={index}
                      className={cn(
                        'gap-y-2',
                        index !== 0 && 'border-t border-slate-50 pt-6 dark:border-slate-800'
                      )}>
                      <Text variant="heading" size="lg" className="text-slate-900 dark:text-white">
                        {section.title}
                      </Text>
                      <Text className="leading-relaxed text-slate-700 dark:text-slate-300">
                        {section.content}
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}
          </View>
        </View>

        <TrainingSupplements moduleId={id} />
      </ScrollView>
    </Container>
  );
};
