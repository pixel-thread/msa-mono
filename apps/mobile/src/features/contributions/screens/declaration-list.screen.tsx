import React from 'react';
import { View, RefreshControl, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDeclarations } from '../hooks';
import { DeclarationCard } from '../components';
import { Container, StackHeader } from '@src/shared/components';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';
import { Text } from '@src/shared/components/ui';

export const DeclarationListScreen = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useDeclarations();

  if (isLoading) {
    return (
      <>
        <StackHeader showBackButton title="Declarations" />
        <LoadingScreen description="Loading declarations" />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StackHeader showBackButton title="Declarations" />
        <ErrorScreen
          title="Failed to load declarations"
          message="There was an error retrieving declarations. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  return (
    <Container>
      <StackHeader
        title="Declarations"
        showBackButton
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/(protected)/declarations/create')}
            activeOpacity={0.7}>
            <Ionicons name="add" size={24} color="#6366f1" />
          </TouchableOpacity>
        }
      />
      <FlashList
        data={data}
        renderItem={({ item }) => <DeclarationCard declaration={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          <EmptyScreen
            title="No declarations"
            description="Tap the + button to create your first declaration."
            refresh={refetch}
          />
        }
      />
    </Container>
  );
};
