import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import type { Meeting } from '../types';
import { formattedDate, formattedTime } from '@src/shared/utils/format';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { cn } from '@lib/cn';
import { useRouter } from 'expo-router';

interface MeetingCardProps {
  meeting: Meeting;
}

export const MeetingCard = ({ meeting }: MeetingCardProps) => {
  const date = new Date(meeting.scheduledAt);
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const onPress = () => {
    router.push(`/meetings/${meeting.id}`);
  };

  const iconColor = isDark ? '#94a3b8' : '#64748b';
  const chevronColor = isDark ? '#cbd5e1' : '#94a3b8';

  const statusColor =
    meeting.status === 'SCHEDULED'
      ? 'text-emerald-500'
      : meeting.status === 'IN_PROGRESS'
        ? 'text-blue-500'
        : 'text-slate-400';

  return (
    <View className="mb-4">
      <Card className="overflow-hidden border-slate-100 shadow-sm dark:border-slate-800">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${meeting.title}, ${meeting.status.replace('_', ' ').toLowerCase()}`}
          accessibilityHint="Opens meeting details">
          <CardContent className="p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 gap-y-2">
                <Text
                  weight="semibold"
                  variant="heading"
                  size="sm"
                  selectable
                  className="text-slate-900 dark:text-white">
                  {meeting.title}
                </Text>

                <View className="gap-y-1.5">
                  <View className="flex-row items-center gap-x-2">
                    <Ionicons name="calendar-outline" size={14} color={iconColor} />
                    <Text variant="subtext" size="xs" className="tabular-nums">
                      {formattedDate(date)} • {formattedTime(date)}
                    </Text>
                  </View>

                  {meeting.venue && (
                    <View className="flex-row items-center gap-x-2">
                      <Ionicons name="location-outline" size={14} color={iconColor} />
                      <Text variant="subtext" size="xs" numberOfLines={1}>
                        {meeting.venue}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row items-center gap-x-1.5">
                  <View className={cn('h-2 w-2 rounded-full', statusColor)} />
                  <Text size="xs" weight="medium" className="text-slate-600 dark:text-slate-400">
                    {meeting.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              <View className="items-end justify-between self-stretch">
                <Ionicons name="chevron-forward" size={18} color={chevronColor} />
                <Text size="xs" variant="subtext">
                  {meeting._count.attendees} attendees
                </Text>
              </View>
            </View>
          </CardContent>
        </TouchableOpacity>
      </Card>
    </View>
  );
};
