import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useTrainingSupplements } from '../hooks/use-training-supplements';
import { SupplementItem } from './supplement-item';
import { Text } from '@src/shared/components/ui';
import { EmptyScreen } from '@src/shared/components/screens';

interface TrainingSupplementsProps {
  moduleId: string;
}

export const TrainingSupplements = ({ moduleId }: TrainingSupplementsProps) => {
  const { data: supplements, isLoading, isError, refetch } = useTrainingSupplements(moduleId);

  if (isLoading) {
    return (
      <View className="px-4 pb-8">
        <Text variant="heading" size="lg" className="mb-4 px-1 text-slate-900 dark:text-white">
          Supplements
        </Text>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="px-4 pb-8">
        <Text variant="heading" size="lg" className="mb-4 px-1 text-slate-900 dark:text-white">
          Supplements
        </Text>
        <EmptyScreen
          title="Failed to load supplements"
          description="There was an error loading the supplements."
          refresh={refetch}
        />
      </View>
    );
  }

  const activeSupplements = supplements
    ?.filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!activeSupplements?.length) {
    return (
      <View className="px-4 pb-8">
        <Text variant="heading" size="lg" className="mb-4 px-1 text-slate-900 dark:text-white">
          Supplements
        </Text>
        <EmptyScreen description="There are no supplements for this module." />
      </View>
    );
  }

  return (
    <View className="px-4 pb-8">
      <Text variant="heading" size="lg" className="mb-4 px-1 text-slate-900 dark:text-white">
        Supplements
      </Text>
      <View className="border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <View className="gap-y-4">
          {activeSupplements.map((supplement, index) => (
            <SupplementItem key={supplement.id} supplement={supplement} isFirst={index === 0} />
          ))}
        </View>
      </View>
    </View>
  );
};
