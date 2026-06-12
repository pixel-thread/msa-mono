import React from 'react';
import { View, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@src/shared/components/ui/text';
import { Button } from '@src/shared/components/ui/button';
import { Container } from '@src/shared/components/common/Container';
import { StackHeader } from '@src/shared/components/common/header/stack-header.component';
import { useMyDSARRequests } from '../hooks/use-dsar';
import { DSARListItem } from '../components/DSARListItem';

import { DSARRequest } from '../types/dsar.types';

export const MemberDSARListScreen = () => {
  const router = useRouter();
  const { data: requests, isLoading, refetch } = useMyDSARRequests();

  const handleNewRequest = () => {
    router.push('/(protected)/profile/privacy/submit');
  };

  const handleViewDetail = (request: DSARRequest) => {
    router.push(`/(protected)/profile/privacy/${request.id}`);
  };

  if (isLoading && !requests) {
    return (
      <Container>
        <StackHeader showBackButton title="Privacy Requests" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <StackHeader
        title="Privacy Requests"
        showBackButton
        rightAction={
          <TouchableOpacity onPress={handleNewRequest} className="mr-1 p-2">
            <Ionicons name="add" size={26} color="#1E293B" />
          </TouchableOpacity>
        }
      />

      <FlashList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DSARListItem request={item} onPress={handleViewDetail} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 py-20">
            <View className="mb-6 bg-slate-100 p-6">
              <Ionicons name="shield-checkmark-outline" size={64} color="#94A3B8" />
            </View>
            <Text weight="bold" size="xl" className="mb-2 text-center text-slate-900">
              No Privacy Requests
            </Text>
            <Text variant="subtext" className="mb-8 text-center text-slate-500">
              You haven&apos;t submitted any data privacy requests yet. You can request access to
              your profile data or payment history anytime.
            </Text>
            <Button onPress={handleNewRequest} className="w-full">
              Submit New Request
            </Button>
          </View>
        }
      />
    </Container>
  );
};
