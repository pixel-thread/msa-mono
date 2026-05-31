import React from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@src/shared/store';
import { Container, StackHeader } from '@components/common';
import { Card, CardContent, Text } from '@components/ui';
import { useRouter } from 'expo-router';
import { useMeetings } from '@features/meetings/hooks';
import { useTrainingModules } from '@features/training/hooks';
import { useAnnouncements } from '@features/announcements/hooks';
import { useNotifications } from '@src/shared/hooks/use-notifications';
import { formattedDate, formattedTime } from '@utils/format';
import { LoadingScreen } from '@components/screens';
import { DashboardActivityCard } from '../components/dashboard-activity-card';
import { DashboardBentoCard } from '../components/dasboard-bento-card';
import { DashboardRightActions } from '../components/dashboard-right-actions';

export const DashboardScreen = () => {
  const { user } = useAuthStore();

  const router = useRouter();

  const {
    data: meetingsData,
    isFetching: isMeetingsFetching,
    refetch: refetchMeetings,
  } = useMeetings({ limit: 1 });

  const {
    data: trainingModules,
    isFetching: isTrainingFetching,
    refetch: refetchTraining,
  } = useTrainingModules();

  const {
    data: announcements,
    isFetching: isAnnouncementsFetching,
    refetch: refetchAnnouncements,
  } = useAnnouncements();

  const { notification } = useNotifications();

  const nextMeeting = meetingsData?.meetings?.[0];
  const latestAnnouncement = announcements?.[0];
  const pendingTrainingCount = trainingModules?.length || 0; // Simplified for now

  const isFetching = isMeetingsFetching || isTrainingFetching || isAnnouncementsFetching;

  const onRefresh = React.useCallback(() => {
    refetchMeetings();
    refetchTraining();
    refetchAnnouncements();
  }, [refetchMeetings, refetchTraining, refetchAnnouncements]);

  if (isFetching || !meetingsData || !trainingModules) {
    return (
      <>
        <StackHeader
          title={'Home'}
          showDrawerButton={true}
          rightAction={
            <View className="px-2">
              <TouchableOpacity
                onPress={() => router.push('/announcements')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="megaphone-outline" size={28} />
              </TouchableOpacity>
            </View>
          }
        />
        <LoadingScreen message="Loading..." />
      </>
    );
  }

  return (
    <Container>
      <StackHeader title="Home" showDrawerButton={true} rightAction={<DashboardRightActions />} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}>
        {/* Welcome Section */}
        <View className="px-4 pb-6 pt-6">
          <Text
            variant="subtext"
            size="sm"
            weight="medium"
            className="uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {formattedDate(new Date())}
          </Text>
          <Text
            variant="heading"
            size="3xl"
            weight={'bold'}
            className="mt-1 capitalize tracking-widest text-slate-900 dark:text-white">
            Hello, {user?.name.split(' ')[0]}
          </Text>
        </View>

        {/* Bento Grid: Row 1 (Quick Actions & Training) */}
        <View className="mb-4 flex-row gap-4 px-4">
          <View className="flex-1 gap-4">
            <DashboardBentoCard
              icon="calendar"
              title="Schedule"
              subtitle="View all"
              color="bg-indigo-600"
              iconColor="#fff"
              textColor="text-white"
              onPress={() => router.push('/(protected)/(drawer)/(tabs)/meetings')}
            />
            <DashboardBentoCard
              icon="document-text"
              title="Docs"
              subtitle="Library"
              color="bg-slate-800"
              iconColor="#fff"
              textColor="text-white"
              onPress={() => {}}
            />
          </View>
          <View className="flex-1">
            <DashboardBentoCard
              className="w-full flex-1 items-center justify-center bg-emerald-50 dark:bg-emerald-950/30"
              icon="school"
              title="Training"
              subtitle={`${pendingTrainingCount} pending`}
              color="bg-transparent"
              iconColor="text-emerald-600 dark:text-emerald-400"
              textColor="text-slate-900 dark:text-white"
              iconSize={48}
              onPress={() => router.push('/(protected)/training')}
            />
          </View>
        </View>

        {/* Bento Grid: Row 2 (Next Meeting) */}
        {nextMeeting && (
          <View className="mb-4 px-4">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(`/(protected)/meetings/${nextMeeting.id}`)}>
              <Card className="overflow-hidden border-0 bg-white shadow-sm dark:bg-slate-900">
                <View className="absolute right-0 top-0 h-32 w-32 -translate-y-10 translate-x-10 bg-indigo-500/10 dark:bg-indigo-500/5" />
                <CardContent className="p-6">
                  <View className="mb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="h-2 w-2 bg-indigo-500" />
                      <Text
                        weight="bold"
                        size="xs"
                        className="uppercase tracking-widest text-indigo-500">
                        Next Up
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#64748b" />
                  </View>
                  <Text
                    variant="heading"
                    size="2xl"
                    className="mb-3 text-slate-900 dark:text-white"
                    numberOfLines={1}>
                    {nextMeeting.title}
                  </Text>
                  <View className="flex-row items-center gap-x-4">
                    <View className="flex-row items-center gap-x-1.5 bg-slate-50 px-3 py-1.5 dark:bg-slate-800">
                      <Ionicons name="time" size={16} color="#4f46e5" />
                      <Text
                        weight="semibold"
                        size="sm"
                        className="text-slate-700 dark:text-slate-300">
                        {formattedTime(new Date(nextMeeting.scheduledAt))}
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            </TouchableOpacity>
          </View>
        )}

        {/* Bento Grid: Row 3 (Recent Activity / Feed) */}
        <View className="px-4 pb-12">
          <Text variant="heading" size="lg" className="mb-4 px-1 text-slate-900 dark:text-white">
            Activity
          </Text>
          <View className="gap-3">
            {notification && (
              <DashboardActivityCard
                icon="notifications"
                color="bg-rose-50 dark:bg-rose-950/30"
                iconColor="text-rose-500"
                title={notification.request.content.title || 'New Notification'}
                description={notification.request.content.body || 'Tap to view details'}
              />
            )}

            {latestAnnouncement ? (
              <DashboardActivityCard
                icon="megaphone"
                color="bg-amber-50 dark:bg-amber-950/30"
                iconColor="text-amber-500"
                title={latestAnnouncement.title}
                description={latestAnnouncement.content}
              />
            ) : (
              <DashboardActivityCard
                icon="checkmark-circle"
                color="bg-slate-50 dark:bg-slate-800/50"
                iconColor="text-slate-400"
                title="All caught up"
                description="No new announcements"
              />
            )}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};
