import React from 'react';
import { View, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMeetingMinuite } from '../hooks';
import { Container, StackHeader } from '@src/shared/components';
import { EmptyScreen, LoadingScreen } from '@src/shared/components/screens';
import { Text } from '@src/shared/components/ui';
import { MinuteCard } from '../components/meeting-minute-card';
import { FlashList } from '@shopify/flash-list';

export const MeetingMinutesScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: minutes = [],
    isLoading,
    refetch,
    isRefetching,
  } = useMeetingMinuite({ meetingId: id as string });

  if (isLoading)
    return (
      <>
        <StackHeader showBackButton title="Meeting Minutes" />
        <LoadingScreen message="Loading meeting minutes..." />
      </>
    );

  return (
    <Container>
      <StackHeader showBackButton title="Meeting Minutes" />
      <FlashList
        data={minutes}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        renderItem={({ item }) => <MinuteCard minute={item} />}
        className="flex-1 p-4"
        ListEmptyComponent={
          <EmptyScreen title="No minutes recorded for this meeting." refresh={refetch} />
        }
      />
    </Container>
  );
};
