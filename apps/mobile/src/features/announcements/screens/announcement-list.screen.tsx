import React from 'react';
import { View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useAnnouncements } from '../hooks';
import { LoadingScreen, ErrorScreen } from '@src/shared/components/screens';
import { Ionicons } from '@expo/vector-icons';
import { AnnouncementCard } from '../components';
import { Container, StackHeader } from '@src/shared/components';
import { Text } from '@src/shared/components/ui';

export const AnnouncementListScreen = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useAnnouncements();

  if (isLoading)
    return (
      <>
        <StackHeader showBackButton title="Announcements" />
        <LoadingScreen message="Fetching announcements..." />
      </>
    );

  if (isError) {
    return (
      <>
        <StackHeader showBackButton title="Announcements" />
        <ErrorScreen
          title="Failed to load announcements"
          message="There was an error retrieving the announcements. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  const sortedData = [...(data || [])].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <Container>
      <StackHeader title="Announcements" showBackButton={true} />
      <FlashList
        data={sortedData}
        renderItem={({ item }) => <AnnouncementCard announcement={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-24">
            <View className="mb-6 h-20 w-20 items-center justify-center bg-slate-100 dark:bg-slate-900">
              <Ionicons name="megaphone-outline" className="text-accent" size={32} />
            </View>
            <Text variant="heading" size="lg" className="text-slate-900 dark:text-white">
              No announcements
            </Text>
            <Text variant="subtext" size="sm" className="mt-2 text-center">
              Check back later for new announcements.
            </Text>
          </View>
        }
      />
    </Container>
  );
};
