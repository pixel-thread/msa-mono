import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useProviderDetail } from '../hooks/use-payment-providers';
import { Container, StackHeader } from '@src/shared/components';

export const ProviderDetailScreen = ({ id }: { id: string }) => {
  const { data: provider, isLoading, error } = useProviderDetail(id);

  if (isLoading)
    return (
      <>
        <StackHeader title="Provider Details" showBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </>
    );

  if (error || !provider)
    return (
      <>
        <StackHeader title="Provider Details" showBackButton />
        <View className="flex-1 items-center justify-center">
          <Text>Error loading provider details</Text>
        </View>
      </>
    );

  return (
    <Container className="flex-1 bg-gray-50 p-4">
      <StackHeader title={provider.provider} showBackButton />
      <View className="bg-white p-6 shadow-sm">
        <Text className="mb-4 text-2xl font-bold">{provider.provider}</Text>

        <View className="mb-3">
          <Text className="text-sm text-gray-500">Status</Text>
          <Text className="font-medium">{provider.isActive ? 'Active' : 'Inactive'}</Text>
        </View>

        <View className="mb-3">
          <Text className="text-sm text-gray-500">Key ID</Text>
          <Text className="font-medium">{provider.keyId}</Text>
        </View>

        <View className="mb-3">
          <Text className="text-sm text-gray-500">Created At</Text>
          <Text className="font-medium">{new Date(provider.createdAt).toLocaleString()}</Text>
        </View>

        <View className="mb-3">
          <Text className="text-sm text-gray-500">Updated At</Text>
          <Text className="font-medium">{new Date(provider.updatedAt).toLocaleString()}</Text>
        </View>
      </View>
    </Container>
  );
};
