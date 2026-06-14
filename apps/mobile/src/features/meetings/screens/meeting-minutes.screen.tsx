import React from 'react';
import { RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMeetingMinute } from '../hooks';
import { Container, StackHeader } from '@src/shared/components';
import { EmptyScreen, LoadingScreen } from '@src/shared/components/screens';
import { MinuteCard } from '../components';
import { FlashList } from '@shopify/flash-list';

export const MeetingMinutesScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: minutes = [],
    isLoading,
    refetch,
    isRefetching,
  } = useMeetingMinute({ meetingId: id as string });

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
        accessibilityLabel="Meeting minutes list"
        ListEmptyComponent={
          <EmptyScreen
            title="No minutes recorded"
            description="Minutes will appear here once they are added to this meeting."
            refresh={refetch}
          />
        }
      />
    </Container>
  );
};
