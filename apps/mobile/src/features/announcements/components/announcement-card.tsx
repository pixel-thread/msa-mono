import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Announcement } from '../types';
import { formattedDate } from '@utils/format';
import { Card, CardContent, Text } from '@components/ui';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@src/shared/store';

interface AnnouncementCardProps {
  announcement: Announcement;
}

const priorityColors = {
  LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  NORMAL: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  HIGH: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  URGENT: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
};

export const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => {
  const router = useRouter();
  const { user } = useAuthStore();

  const isRead = announcement.readReceipts.some((r) => r.userId === user?.id);

  const publishedDate = announcement.publishedAt ? new Date(announcement.publishedAt) : null;

  const onPress = () => {
    router.push(`/announcements/${announcement.id}`);
  };

  return (
    <View className="mb-4">
      <Card className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          <CardContent className="p-4">
            <View className="flex-row items-start gap-x-3">
              <View className="mt-1">
                {!isRead && <View className="h-2.5 w-2.5 bg-indigo-500" />}
              </View>

              <View className="flex-1">
                <View className="mb-2 flex-row flex-wrap items-center gap-x-2 gap-y-1">
                  {announcement.isPinned && (
                    <View className="flex-row items-center gap-x-1 bg-amber-50 px-2 py-0.5 dark:bg-amber-900/20">
                      <Ionicons name="pin" size={10} color="#d97706" />
                      <Text
                        size="xs"
                        weight="medium"
                        className="text-amber-700 dark:text-amber-400">
                        Pinned
                      </Text>
                    </View>
                  )}

                  <View className={`px-2 py-0.5 ${priorityColors[announcement.priority]}`}>
                    <Text size="xs" weight="medium" className="text-[10px]">
                      {announcement.priority}
                    </Text>
                  </View>
                </View>

                <Text
                  weight="semibold"
                  variant="heading"
                  size="sm"
                  className="mb-2 text-slate-900 dark:text-white">
                  {announcement.title}
                </Text>

                {announcement.summary && (
                  <Text
                    variant="subtext"
                    size="sm"
                    numberOfLines={2}
                    className="mb-3 text-slate-600 dark:text-slate-400">
                    {announcement.summary}
                  </Text>
                )}

                <View className="flex-row items-center gap-x-3">
                  {announcement.author.name && (
                    <View className="flex-row items-center gap-x-1">
                      <Ionicons name="person-outline" size={12} color="#64748b" />
                      <Text variant="subtext" size="xs" className="text-slate-500">
                        {announcement.author.name}
                      </Text>
                    </View>
                  )}

                  {publishedDate && (
                    <View className="flex-row items-center gap-x-1">
                      <Ionicons name="calendar-outline" size={12} color="#64748b" />
                      <Text variant="subtext" size="xs" className="text-slate-500">
                        {formattedDate(publishedDate)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View className="items-center justify-center">
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </View>
            </View>
          </CardContent>
        </TouchableOpacity>
      </Card>
    </View>
  );
};
