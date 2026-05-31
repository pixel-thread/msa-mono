import React from 'react';
import { View, Switch, ActivityIndicator } from 'react-native';
import { Text } from '@components/ui';
import { ConsentPurpose, ConsentStatus } from '../types';

interface ConsentToggleCardProps {
  purpose: ConsentPurpose;
  status?: ConsentStatus;
  isLoading: boolean;
  onToggle: (purpose: ConsentPurpose, grant: boolean) => void;
}

export const ConsentToggleCard = ({
  purpose,
  status,
  isLoading,
  onToggle,
}: ConsentToggleCardProps) => {
  const isGranted = status === ConsentStatus.GRANTED;

  return (
    <View className="mb-2 flex-row items-center justify-between border border-slate-200 bg-white p-4 shadow-sm">
      <View className="mr-4 flex-1">
        <Text className="text-base font-semibold text-slate-900">{purpose}</Text>
        <Text className="mt-1 text-sm text-slate-500">
          Allow us to process your data for {purpose.toLowerCase()} purposes.
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color="#4f46e5" />
      ) : (
        <Switch
          value={isGranted}
          onValueChange={(val) => onToggle(purpose, val)}
          trackColor={{ false: '#cbd5e1', true: '#818cf8' }}
          thumbColor={isGranted ? '#4f46e5' : '#f8fafc'}
        />
      )}
    </View>
  );
};
