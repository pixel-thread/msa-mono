# Dashboard Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the dashboard to a modern bento-box UI integrating meetings, training, and notifications/announcements.

**Architecture:** Use NativeWind layout utilities (`flex-row`, `flex-1`, `gap-4`) to build a bento box grid. Fetch data via existing hooks (`useMeetings`, `useTrainingModules`, `useAnnouncements`, `useNotifications`).

**Tech Stack:** React Native, Expo, NativeWind, TanStack Query

---

### Task 1: Update DashboardScreen UI and Data Fetching

**Files:**
- Modify: `src/features/dashboard/screens/dashboard.screen.tsx`

- [ ] **Step 1: Import necessary hooks and components**

```tsx
import React, { ComponentProps } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@src/shared/store';
import { Container, StackHeader } from '@components/common';
import { Card, CardContent, Text } from '@components/ui';
import { cn } from '@lib/cn';
import { useRouter } from 'expo-router';
import { useMeetings } from '@features/meetings/hooks';
import { useTrainingModules } from '@features/training/hooks';
import { useAnnouncements } from '@features/announcements/hooks';
import { useNotifications } from '@src/shared/hooks/use-notifications';
import { formattedDate, formattedTime } from '@utils/format';
import { LoadingScreen } from '@components/screens';
```

- [ ] **Step 2: Add hooks to DashboardScreen component**

```tsx
export const DashboardScreen = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const { data: meetingsData, isFetching: isMeetingsFetching, refetch: refetchMeetings } = useMeetings({ limit: 1 });
  const { data: trainingModules, isFetching: isTrainingFetching, refetch: refetchTraining } = useTrainingModules();
  const { data: announcements, isFetching: isAnnouncementsFetching, refetch: refetchAnnouncements } = useAnnouncements();
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

  if (isFetching && !meetingsData && !trainingModules) {
    return (
      <>
        <StackHeader title="Dashboard" showDrawerButton={true} />
        <LoadingScreen message="Loading..." />
      </>
    );
  }

  if (!user) return null;

  return (
    <Container>
      <StackHeader title="Dashboard" showDrawerButton={true} />
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={onRefresh} />}
      >
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
            Hello, {user.name?.split(' ')[0]}
          </Text>
        </View>

        {/* Bento Grid: Row 1 (Quick Actions & Training) */}
        <View className="flex-row gap-4 px-4 mb-4">
          <View className="flex-1 gap-4">
            <BentoCard 
              icon="calendar" 
              title="Schedule" 
              subtitle="View all"
              color="bg-indigo-600" 
              iconColor="text-white"
              textColor="text-white"
              onPress={() => router.push('/(protected)/(drawer)/(tabs)/meetings')}
            />
            <BentoCard 
              icon="document-text" 
              title="Docs" 
              subtitle="Library"
              color="bg-slate-800" 
              iconColor="text-white"
              textColor="text-white"
              onPress={() => {}}
            />
          </View>
          <View className="flex-1">
            <BentoCard 
              className="flex-1 justify-center items-center bg-emerald-50 dark:bg-emerald-950/30"
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
          <View className="px-4 mb-4">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(`/(protected)/meetings/${nextMeeting.id}`)}>
              <Card className="overflow-hidden border-0 shadow-sm rounded-[32px] bg-white dark:bg-slate-900">
                <View className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full -translate-y-10 translate-x-10" />
                <CardContent className="p-6">
                  <View className="mb-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="w-2 h-2 rounded-full bg-indigo-500" />
                      <Text weight="bold" size="xs" className="uppercase tracking-widest text-indigo-500">
                        Next Up
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#64748b" />
                  </View>
                  <Text variant="heading" size="2xl" className="mb-3 text-slate-900 dark:text-white" numberOfLines={1}>
                    {nextMeeting.title}
                  </Text>
                  <View className="flex-row items-center gap-x-4">
                    <View className="flex-row items-center gap-x-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                      <Ionicons name="time" size={16} color="#4f46e5" />
                      <Text weight="semibold" size="sm" className="text-slate-700 dark:text-slate-300">
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
              <ActivityCard 
                icon="notifications" 
                color="bg-rose-50 dark:bg-rose-950/30" 
                iconColor="text-rose-500"
                title={notification.request.content.title || "New Notification"}
                description={notification.request.content.body || "Tap to view details"}
              />
            )}
            
            {latestAnnouncement ? (
              <ActivityCard 
                icon="megaphone" 
                color="bg-amber-50 dark:bg-amber-950/30" 
                iconColor="text-amber-500"
                title={latestAnnouncement.title}
                description={latestAnnouncement.content}
              />
            ) : (
               <ActivityCard 
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
```

- [ ] **Step 3: Define Helper Components for the Dashboard**

Add these to the bottom of the file:

```tsx
const BentoCard = ({
  icon,
  title,
  subtitle,
  onPress,
  color,
  iconColor,
  textColor,
  className,
  iconSize = 28
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  onPress: () => void;
  color: string;
  iconColor: string;
  textColor: string;
  className?: string;
  iconSize?: number;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} className={cn("flex-1", className)}>
    <View className={cn('rounded-[32px] p-6 shadow-sm', color, className)}>
      <Ionicons name={icon} size={iconSize} className={iconColor} />
      <View className="mt-4">
        <Text weight="bold" size="lg" className={textColor}>
          {title}
        </Text>
        {subtitle && (
          <Text weight="medium" size="xs" className={cn("mt-1 opacity-80", textColor)}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const ActivityCard = ({ 
  icon, 
  title, 
  description, 
  color, 
  iconColor 
}: { 
  icon: ComponentProps<typeof Ionicons>['name']; 
  title: string; 
  description: string; 
  color: string; 
  iconColor: string;
}) => (
  <Card className="border-0 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
    <CardContent className="p-4 flex-row items-center gap-4">
      <View className={cn("w-12 h-12 rounded-2xl items-center justify-center", color)}>
        <Ionicons name={icon} size={24} className={iconColor} />
      </View>
      <View className="flex-1">
        <Text weight="bold" size="sm" className="text-slate-900 dark:text-white" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="subtext" size="xs" className="mt-0.5" numberOfLines={2}>
          {description}
        </Text>
      </View>
    </CardContent>
  </Card>
);
```

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/screens/dashboard.screen.tsx
git commit -m "feat(dashboard): refactor to modern bento box UI with meetings, training, and notifications"
```
