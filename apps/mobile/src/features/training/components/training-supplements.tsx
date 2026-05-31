import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrainingSupplements } from '../hooks/use-training-supplements';
import { formatFileSize, handleFileDownload, handleFileShare } from '../utils';
import { LoadingScreen, ErrorScreen } from '@src/shared/components/screens';
import { Text, Image } from '@src/shared/components/ui';
import { cn } from '@lib/cn';

interface TrainingSupplementsProps {
  moduleId: string;
}

export const TrainingSupplements = ({ moduleId }: TrainingSupplementsProps) => {
  const { data: supplements, isLoading, isError, refetch } = useTrainingSupplements(moduleId);

  if (isLoading) return <LoadingScreen message="Loading supplements..." />;

  if (isError) {
    return (
      <ErrorScreen
        title="Failed to load supplements"
        message="There was an error loading the supplements. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (!supplements || supplements.length === 0) return null;

  return (
    <View className="px-4 pb-8">
      <Text variant="heading" size="lg" className="mb-4 px-1 text-slate-900 dark:text-white">
        Supplements
      </Text>
      <View className="border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <View className="gap-y-4">
          {supplements
            .filter((s) => s.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((supplement, index) => {
              const iconName =
                supplement.type === 'VIDEO'
                  ? 'videocam-outline'
                  : supplement.type === 'IMAGE'
                    ? 'image-outline'
                    : 'document-outline';

              return (
                <View
                  key={supplement.id}
                  className={cn(
                    'flex-row items-start gap-3',
                    index !== 0 && 'border-t border-slate-50 pt-4 dark:border-slate-800'
                  )}>
                  <View className="bg-slate-100 p-2 dark:bg-slate-800">
                    <Ionicons name={iconName} size={20} color="#64748b" />
                  </View>

                  <View className="flex-1 gap-y-1">
                    <Text variant="heading" size="sm" className="text-slate-900 dark:text-white">
                      {supplement.title}
                    </Text>
                    {supplement.description && (
                      <Text variant="subtext" size="xs" className="leading-relaxed">
                        {supplement.description}
                      </Text>
                    )}

                    {supplement.thumbnailUrl && (
                      <View className="mt-1 overflow-hidden ">
                        <Image
                          source={{ uri: supplement.thumbnailUrl }}
                          className="h-32 w-full"
                          resizeMode="cover"
                        />
                      </View>
                    )}

                    <View className="mt-1 flex-row items-center gap-x-3">
                      <View className="flex-row items-center gap-x-1">
                        <Ionicons name="document-outline" size={12} color="#94a3b8" />
                        <Text variant="subtext" size="xs" className="text-slate-400">
                          {formatFileSize(supplement.fileSize)}
                        </Text>
                      </View>
                      {supplement.durationSeconds && (
                        <View className="flex-row items-center gap-x-1">
                          <Ionicons name="time-outline" size={12} color="#94a3b8" />
                          <Text variant="subtext" size="xs" className="text-slate-400">
                            {Math.round(supplement.durationSeconds / 60)} min
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-center gap-1">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleFileShare(supplement.fileUrl, supplement.title)}
                      className="p-2">
                      <Ionicons name="share-outline" size={20} color="#6366f1" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleFileDownload(supplement.fileUrl, supplement.title)}
                      className="p-2">
                      <Ionicons name="download-outline" size={20} color="#6366f1" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
        </View>
      </View>
    </View>
  );
};
