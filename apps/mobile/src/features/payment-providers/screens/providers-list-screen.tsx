import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { useProviders } from '../hooks/use-payment-providers';
import { useActivateProvider, useDeleteProvider } from '../hooks/use-payment-provider-mutations';
import { ProviderCard } from '../components/provider-card';
import { Container, StackHeader } from '@src/shared/components';

export const ProvidersListScreen = () => {
  const router = useRouter();
  const { data: providers, isLoading, error } = useProviders();
  const { mutate: activateProvider, isPending: isActivating } = useActivateProvider();
  const { mutate: deleteProvider, isPending: isDeleting } = useDeleteProvider();

  const handleActivate = (id: string) => {
    activateProvider(id, {
      onSuccess: () => toast.success('Provider activated'),
      onError: () => toast.error('Failed to activate provider'),
    });
  };

  const handleDelete = (id: string) => {
    deleteProvider(id, {
      onSuccess: () => toast.success('Provider deleted'),
      onError: () => toast.error('Failed to delete provider'),
    });
  };

  const handlePress = (id: string) => {
    router.push(`/payments/providers/${id}`);
  };

  if (isLoading)
    return (
      <>
        <StackHeader title="Providers" showBackButton />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  if (error)
    return (
      <>
        <StackHeader title="Providers" showBackButton />
        <View className="flex-1 items-center justify-center">
          <Text>Error loading providers</Text>
        </View>
      </>
    );

  return (
    <Container>
      <StackHeader title="Providers" showBackButton />
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ProviderCard
            provider={item}
            onActivate={handleActivate}
            onDelete={handleDelete}
            onPress={handlePress}
            isActivating={isActivating}
            isDeleting={isDeleting}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-gray-500">No payment providers configured</Text>
          </View>
        }
      />
      <View className="border-t border-gray-200 bg-white p-4">
        <TouchableOpacity
          className="items-center bg-blue-600 p-4"
          onPress={() => router.push('/payments/providers/add')}>
          <Text className="text-lg font-bold text-white">Add Provider</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
};
