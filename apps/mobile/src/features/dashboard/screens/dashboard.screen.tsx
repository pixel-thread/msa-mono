import React from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@src/shared/store';
import { Container, StackHeader } from '@components/common';
import { Card, Text } from '@components/ui';
import { useRouter } from 'expo-router';
import { formattedDate } from '@utils/format';
import { ErrorScreen, LoadingScreen } from '@components/screens';
import { useDashboard } from '../hooks';
import { DashboardRightActions } from '../components/dashboard-right-actions';

const quickActions = [
  {
    icon: 'calendar-outline' as const,
    label: 'Schedule',
    route: '/(protected)/(drawer)/(tabs)/meetings' as const,
  },
  { icon: 'document-text-outline' as const, label: 'Docs', route: null },
  { icon: 'school-outline' as const, label: 'Training', route: '/(protected)/training' as const },
  { icon: 'people-outline' as const, label: 'Members', route: null },
  { icon: 'settings-outline' as const, label: 'Settings', route: null },
];

export const DashboardScreen = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: overview, isFetching, refetch, isError, error } = useDashboard();

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  if (isFetching && !overview) {
    return (
      <>
        <StackHeader
          title={'Home'}
          showDrawerButton={true}
          rightAction={<DashboardRightActions />}
        />
        <LoadingScreen message="Loading..." />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StackHeader title="Home" showDrawerButton={true} rightAction={<DashboardRightActions />} />
        <ErrorScreen message={error?.message} title="Something went wrong" retryText="Retry" />
      </>
    );
  }

  const stats = overview?.stats;
  const recentPayments = overview?.recentPayments ?? [];

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

        {/* Stats Row */}
        {stats && (
          <View className="mb-6 flex-row gap-2 bg-slate-200 px-4 dark:bg-slate-800">
            <View className="flex-1 bg-white p-4 dark:bg-slate-900">
              <Ionicons name="people" size={22} color="#4f46e5" />
              <Text size="2xl" weight="bold" className="mt-2 text-slate-900 dark:text-white">
                {stats.totalMembers}
              </Text>
              <Text size="xs" className="text-slate-500 dark:text-slate-400">
                Members
              </Text>
            </View>
            <View className="flex-1 bg-white p-4 dark:bg-slate-900">
              <Ionicons name="cash" size={22} color="#059669" />
              <Text size="2xl" weight="bold" className="mt-2 text-slate-900 dark:text-white">
                ₹{stats.totalRevenueMonth}
              </Text>
              <Text size="xs" className="text-slate-500 dark:text-slate-400">
                Revenue
              </Text>
            </View>
            <View className="flex-1 bg-white p-4 dark:bg-slate-900">
              <Ionicons name="alert-circle" size={22} color="#dc2626" />
              <Text size="2xl" weight="bold" className="mt-2 text-slate-900 dark:text-white">
                ₹{stats.pendingDuesAmount}
              </Text>
              <Text size="xs" className="text-slate-500 dark:text-slate-400">
                Dues
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="mb-6 border-b border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <View className="flex-row px-4 py-5">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => {
                  if (action.route) router.push(action.route);
                }}
                activeOpacity={0.6}
                className="flex-1 items-center gap-1.5">
                <View className="items-center justify-center border border-slate-200 px-5 py-3 dark:border-slate-700">
                  <Ionicons name={action.icon} size={22} color="#64748b" />
                </View>
                <Text size="xs" className="text-slate-500 dark:text-slate-400">
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Payments */}
        {recentPayments.length > 0 && (
          <View className="mb-6 px-4">
            <Text variant="heading" size="lg" className="mb-3 px-1 text-slate-900 dark:text-white">
              Recent Payments
            </Text>
            <Card className="overflow-hidden border-0 bg-white shadow-sm dark:bg-slate-900">
              {recentPayments.slice(0, 5).map((payment, index) => (
                <View
                  key={payment.id}
                  className={`flex-row items-center justify-between px-5 py-4 ${
                    index < recentPayments.slice(0, 5).length - 1
                      ? 'border-b border-slate-100 dark:border-slate-800'
                      : ''
                  }`}>
                  <View className="flex-1 flex-row items-center gap-3">
                    <View
                      className={`h-10 w-10 items-center justify-center ${
                        payment.status === 'COMPLETED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30'
                          : 'bg-amber-50 dark:bg-amber-950/30'
                      }`}>
                      <Ionicons
                        name={payment.status === 'COMPLETED' ? 'checkmark' : 'time'}
                        size={18}
                        color={payment.status === 'COMPLETED' ? '#059669' : '#d97706'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        weight="semibold"
                        size="sm"
                        className="text-slate-900 dark:text-white"
                        numberOfLines={1}>
                        {payment.userName}
                      </Text>
                      <Text size="xs" className="text-slate-500 dark:text-slate-400">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text
                      weight="bold"
                      className={
                        payment.status === 'COMPLETED'
                          ? 'text-slate-900 dark:text-white'
                          : 'text-amber-600'
                      }>
                      ₹{payment.amount}
                    </Text>
                    {payment.method && (
                      <Text size="xs" className="text-slate-400 dark:text-slate-500">
                        {payment.method}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Activity Section */}
        <View className="px-4 pb-12">
          <Text variant="heading" size="lg" className="mb-4 px-1 text-slate-900 dark:text-white">
            Activity
          </Text>
          <View className="gap-px bg-slate-200 dark:bg-slate-800">
            {stats && stats.newMembersThisMonth > 0 && (
              <View className="flex-row items-center gap-4 bg-white p-4 dark:bg-slate-900">
                <View className="h-12 w-12 items-center justify-center bg-indigo-100 dark:bg-indigo-900/50">
                  <Ionicons name="person-add" size={22} color="#4f46e5" />
                </View>
                <View className="flex-1">
                  <Text weight="semibold" size="sm" className="text-slate-900 dark:text-white">
                    {stats.newMembersThisMonth} new member
                    {stats.newMembersThisMonth !== 1 ? 's' : ''}
                  </Text>
                  <Text size="xs" className="text-slate-500 dark:text-slate-400">
                    Joined this month
                  </Text>
                </View>
              </View>
            )}
            {stats && stats.activeMembers > 0 && (
              <View className="flex-row items-center gap-4 bg-white p-4 dark:bg-slate-900">
                <View className="h-12 w-12 items-center justify-center bg-emerald-100 dark:bg-emerald-900/50">
                  <Ionicons name="people" size={22} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text weight="semibold" size="sm" className="text-slate-900 dark:text-white">
                    {stats.activeMembers} active member{stats.activeMembers !== 1 ? 's' : ''}
                  </Text>
                  <Text size="xs" className="text-slate-500 dark:text-slate-400">
                    Out of {stats.totalMembers} total
                  </Text>
                </View>
              </View>
            )}
            {!stats?.newMembersThisMonth && !stats?.activeMembers && (
              <View className="flex-row items-center gap-4 bg-white p-4 dark:bg-slate-900">
                <View className="h-12 w-12 items-center justify-center bg-slate-200 dark:bg-slate-700">
                  <Ionicons name="checkmark-circle" size={22} color="#94a3b8" />
                </View>
                <View className="flex-1">
                  <Text weight="semibold" size="sm" className="text-slate-900 dark:text-white">
                    All caught up
                  </Text>
                  <Text size="xs" className="text-slate-500 dark:text-slate-400">
                    No recent activity
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};
