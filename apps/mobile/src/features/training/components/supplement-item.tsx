import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TrainingSupplement } from '../types';
import { getMimeIcon } from '../constants';
import { formatFileSize, handleFileDownload, handleFileShare } from '../utils';
import { Text, Image } from '@src/shared/components/ui';
import { cn } from '@lib/cn';

interface SupplementItemProps {
  supplement: TrainingSupplement;
  isFirst: boolean;
}

export const SupplementItem = ({ supplement, isFirst }: SupplementItemProps) => {
  const iconName = getMimeIcon(supplement.file.mimeType);

  return (
    <View
      className={cn(
        'flex-row items-start gap-3',
        !isFirst && 'border-t border-slate-50 pt-4 dark:border-slate-800'
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

        {supplement.file.mimeType.startsWith('image/') && (
          <View className="mt-1 overflow-hidden">
            <Image
              source={{ uri: supplement.thumbnailUrl || supplement.file.url }}
              className="h-32 w-full"
              resizeMode="cover"
            />
          </View>
        )}

        <View className="mt-1 flex-row items-center gap-x-3">
          <View className="flex-row items-center gap-x-1">
            <Ionicons name="document-outline" size={12} color="#94a3b8" />
            <Text variant="subtext" size="xs" className="text-slate-400">
              {formatFileSize(supplement.file.sizeBytes)}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-1">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleFileShare(supplement.downloadUrl, supplement.title)}
          className="p-2">
          <Ionicons name="share-outline" size={20} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleFileDownload(supplement.imageUrl, supplement.title)}
          className="p-2">
          <Ionicons name="download-outline" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
