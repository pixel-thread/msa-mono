import React from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTrainingModule, useMyTrainingCompletions } from '../hooks';
import { TrainingSupplements, ModuleHero, ModuleContent } from '../components';
import { parseModuleContent } from '../utils';
import { LoadingScreen, ErrorScreen } from '@src/shared/components/screens';
import { Container, StackHeader } from '@src/shared/components';

export const TrainingDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: module, isLoading, isError, refetch } = useTrainingModule(id || '');
  const { data: completions } = useMyTrainingCompletions();

  const isCompleted = completions?.some((c) => c.moduleId === id) || false;
  const content = React.useMemo(() => parseModuleContent(module?.content), [module?.content]);

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
        <ModuleHero module={module} isCompleted={isCompleted} />
        {content && <ModuleContent content={content} />}
        <TrainingSupplements moduleId={id} />
      </ScrollView>
    </Container>
  );
};
