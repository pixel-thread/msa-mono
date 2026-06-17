import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TrainingModule } from '../types';
import { StatusBadge } from './status-badge';
import { Card, CardContent, Text } from '@src/shared/components/ui';

interface TrainingCardProps {
  module: TrainingModule;
  isCompleted: boolean;
  onPress: () => void;
}

export const TrainingCard = ({ module, isCompleted, onPress }: TrainingCardProps) => (
  <View className="mb-4">
    <Card className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <CardContent className="p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="mb-2 flex-row items-center gap-x-2">
                <StatusBadge
                  variant={isCompleted ? 'completed' : 'required'}
                  label={isCompleted ? 'COMPLETED' : 'REQUIRED'}
                />
              </View>

              <Text
                weight="semibold"
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
