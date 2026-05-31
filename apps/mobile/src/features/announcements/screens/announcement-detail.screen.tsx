import React, { useEffect } from 'react';
import { View, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAnnouncement } from '../hooks';
import { LoadingScreen, ErrorScreen } from '@src/shared/components/screens';
import { Container, StackHeader } from '@src/shared/components';
import { Text } from '@src/shared/components/ui';
import { formattedDate } from '@utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@src/shared/store';
import { useMarkAnnouncementRead } from '../hooks/use-mark-annoucement-read';

const priorityColors = {
  LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  NORMAL: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  HIGH: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  URGENT: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
};

export const AnnouncementDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: announcement, isLoading, isError, refetch } = useAnnouncement(id || '');
  const { user } = useAuthStore();
  const { mutate } = useMarkAnnouncementRead();

  useEffect(() => {
    if (id) {
      mutate(id);
    }
  }, []);

  if (isLoading)
    return (
      <>
        <StackHeader showBackButton title="Announcement" />
        <LoadingScreen message="Loading announcement..." />
      </>
    );

  if (isError || !announcement) {
    return (
      <>
        <StackHeader showBackButton title="Announcement" />
        <ErrorScreen
          title="Failed to load announcement"
          message="There was an error loading this announcement. Please try again."
          onRetry={() => refetch()}
        />
      </>
    );
  }

  const isRead = announcement.readReceipts.some((r) => r.userId === user?.id);
  const publishedDate = announcement.publishedAt ? new Date(announcement.publishedAt) : null;
  const expiresDate = announcement.expiresAt ? new Date(announcement.expiresAt) : null;

  return (
    <Container>
      <StackHeader showBackButton title="Announcement" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row flex-wrap items-center gap-x-2 gap-y-2">
          {announcement.isPinned && (
            <View className="flex-row items-center gap-x-1 bg-amber-50 px-3 py-1.5 dark:bg-amber-900/20">
              <Ionicons name="pin" size={14} color="#d97706" />
              <Text size="sm" weight="medium" className="text-amber-700 dark:text-amber-400">
                Pinned
              </Text>
            </View>
          )}

          <View className={`px-3 py-1.5 ${priorityColors[announcement.priority]}`}>
            <Text size="sm" weight="medium">
              {announcement.priority}
            </Text>
          </View>

          {!isRead && (
            <View className="bg-indigo-50 px-3 py-1.5 dark:bg-indigo-900/20">
              <Text size="sm" weight="medium" className="text-indigo-700 dark:text-indigo-400">
                Unread
              </Text>
            </View>
          )}
        </View>

        <Text
          variant="heading"
          size="xl"
          weight="bold"
          className="mb-4 text-slate-900 dark:text-white">
          {announcement.title}
        </Text>

        <View className="mb-6 flex-row flex-wrap items-center gap-x-4 gap-y-2">
          {announcement.author.name && (
            <View className="flex-row items-center gap-x-2">
              <Ionicons name="person-outline" size={16} color="#64748b" />
              <Text variant="subtext" size="sm" className="text-slate-600 dark:text-slate-400">
                {announcement.author.name}
              </Text>
            </View>
          )}

          {publishedDate && (
            <View className="flex-row items-center gap-x-2">
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text variant="subtext" size="sm" className="text-slate-600 dark:text-slate-400">
                {formattedDate(publishedDate)}
              </Text>
            </View>
          )}
        </View>

        {announcement.imageUrl && (
          <Image
            source={{ uri: announcement.imageUrl }}
            className="mb-6 h-48 w-full "
            resizeMode="cover"
          />
        )}

        {announcement.summary && (
          <View className="mb-6 bg-slate-50 p-4 dark:bg-slate-800">
            <Text variant="subtext" size="sm" className="text-slate-700 dark:text-slate-300">
              {announcement.summary}
            </Text>
          </View>
        )}

        <Text variant="default" size="lg" className="text-slate-700 dark:text-slate-300">
          {announcement.content}
        </Text>

        {expiresDate && (
          <View className="mt-6 border border-slate-200 p-4 dark:border-slate-700">
            <View className="flex-row items-center gap-x-2">
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text variant="subtext" size="sm" className="text-slate-600 dark:text-slate-400">
                Expires on {formattedDate(expiresDate)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Container>
  );
};

