import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CompactErrorProps {
  message?: string;
  onRetry: () => void;
}

export const CompactError = ({ message = 'Something went wrong', onRetry }: CompactErrorProps) => {
  return (
    <View className="my-2 border border-red-100 bg-red-50 p-4">
      <View className="flex-row items-center gap-x-3">
        <Ionicons name="alert-circle" size={20} color="#ef4444" />
        <View className="ml-2 flex-1">
          <Text className="text-sm font-medium text-red-800">{message}</Text>
          <TouchableOpacity onPress={onRetry} className="mt-1">
            <Text className="text-xs font-bold text-red-600 underline">Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
