import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TrainingModule } from '../types';
import { StatusBadge } from './status-badge';
import { Text } from '@src/shared/components/ui';
import { formattedDate } from '@utils/format';

interface ModuleHeroProps {
  module: TrainingModule;
  isCompleted: boolean;
}

export const ModuleHero = ({ module, isCompleted }: ModuleHeroProps) => (
  <View className="px-4 pb-8 pt-6">
    <View className="mb-4 flex-row flex-wrap items-center gap-2">
      {module.requiredForRoles.map((role) => (
        <View key={role} className="bg-indigo-600 px-2 py-0.5">
          <Text weight="bold" size="xs" className="uppercase tracking-widest text-white">
            {role.replace('_', ' ')}
          </Text>
        </View>
      ))}

      <StatusBadge
        variant={isCompleted ? 'completed' : 'pending'}
        label={isCompleted ? 'Completed' : 'Pending'}
      />
    </View>

    <Text variant="heading" size="3xl" className="leading-tight text-slate-900 dark:text-white">
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
);
