import React, { useCallback } from 'react';
import { View, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@src/shared/components/ui/text';
import { Button } from '@src/shared/components/ui/button';
import { Container } from '@src/shared/components/common/Container';
import { StackHeader } from '@src/shared/components/common/header/stack-header.component';
import { ErrorScreen } from '@src/shared/components/screens/error-screen';
import { useMyCompliance } from '../hooks/use-my-compliance';
import { ComplianceListItem } from '../components/ComplianceListItem';
import { Compliance } from '../types/compliance.types';

export const MemberComplianceListScreen = () => {
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isFetching,
  } = useMyCompliance();

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

  const handleNewCompliance = () => {
    router.push('/(protected)/compliance/submit');
  };

  const handleViewDetail = (compliance: Compliance) => {
    router.push(`/(protected)/compliance/${compliance.id}`);
  };

  if (isLoading) {
    return (
      <Container>
        <StackHeader showBackButton title="Compliance" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <StackHeader showBackButton title="Compliance" />
        <ErrorScreen
          title="Failed to load compliance"
          message="There was an error retrieving your compliance records. Please try again."
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  return (
    <Container>
      <StackHeader
        title="Compliance"
        showBackButton
        rightAction={
          <TouchableOpacity onPress={handleNewCompliance} className="mr-1 p-2">
            <Ionicons name="add" size={26} color="#1E293B" />
          </TouchableOpacity>
        }
      />

      <FlashList
        data={data?.compliance}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ComplianceListItem compliance={item} onPress={handleViewDetail} />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 py-20">
            <View className="mb-6 bg-slate-100 p-6">
              <Ionicons name="warning-outline" size={64} color="#94A3B8" />
            </View>
            <Text weight="bold" size="xl" className="mb-2 text-center text-slate-900">
              No Compliance
            </Text>
            <Text variant="subtext" className="mb-8 text-center text-slate-500">
              You haven&apos;t submitted any compliance yet. If you have an issue, we&apos;re here
              to help.
            </Text>
            <Button onPress={handleNewCompliance} className="w-full">
              Submit a Compliance
            </Button>
          </View>
        }
      />
    </Container>
  );
};
