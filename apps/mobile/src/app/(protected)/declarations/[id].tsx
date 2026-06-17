import React from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDeclaration } from '@src/features/contributions/hooks/use-declaration';
import { DeclarationStatusBadge } from '@src/features/contributions/components/declaration-status-badge';
import { Container, StackHeader } from '@src/shared/components';
import { Card, CardContent, Text } from '@src/shared/components/ui';
import { LoadingScreen, ErrorScreen, EmptyScreen } from '@src/shared/components/screens';
import { formattedDate } from '@src/shared/utils/format';

export default function DeclarationDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: declaration, isLoading, isError, refetch, isRefetching } = useDeclaration(id);

  if (isLoading) {
    return (
      <Container>
        <StackHeader showBackButton title="Declaration" />
        <LoadingScreen message="Loading declaration..." />
      </Container>
    );
  }

  if (!declaration) {
    return (
      <Container>
        <StackHeader showBackButton title="Declaration" />
        <EmptyScreen
          title="No declaration found"
          description="This declaration does not exist. Please try again."
          refresh={() => refetch()}
        />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <StackHeader showBackButton title="Declaration" />
        <ErrorScreen
          title="Failed to load declaration"
          message="There was an error loading this declaration. Please try again."
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  const startDate = new Date(declaration.declerationStartDate);

  const endDate = new Date(declaration.declerationEndDate);

  return (
    <Container>
      <StackHeader showBackButton title="Declaration" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }>
        <View className="mb-6 flex-row items-start justify-between">
          <View className="flex-1">
            <Text variant="heading" size="2xl" className="mb-1 text-slate-900 dark:text-white">
              ₹{declaration.amount}
            </Text>
            <Text variant="subtext" size="sm">
              {formattedDate(startDate)} — {formattedDate(endDate)}
            </Text>
          </View>
          <DeclarationStatusBadge status={declaration.status} />
        </View>

        <Card className="mb-4">
          <CardContent className="p-4">
            <Text weight="semibold" size="sm" className="mb-3 text-slate-700 dark:text-slate-300">
              Member Information
            </Text>
            <View className="mb-3 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center bg-indigo-100">
                <Text weight="bold" size="sm" className="text-indigo-700">
                  {declaration.member.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text size="sm" weight="medium" className="text-slate-900 dark:text-white">
                  {declaration.member.name}
                </Text>
                <Text variant="subtext" size="xs">
                  {declaration.member.email}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="call-outline" size={14} color="#64748b" />
              <Text variant="subtext" size="sm">
                {declaration.member.mobile}
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4">
            <Text weight="semibold" size="sm" className="mb-3 text-slate-700 dark:text-slate-300">
              Declaration Period
            </Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text variant="subtext" size="xs" className="mb-1 font-medium text-slate-500">
                  Start Date
                </Text>
                <Text size="sm" className="text-slate-900 dark:text-white">
                  {formattedDate(startDate)}
                </Text>
              </View>
              <View className="flex-1">
                <Text variant="subtext" size="xs" className="mb-1 font-medium text-slate-500">
                  End Date
                </Text>
                <Text size="sm" className="text-slate-900 dark:text-white">
                  {formattedDate(endDate)}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {declaration.remark && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <Text weight="semibold" size="sm" className="mb-2 text-slate-700 dark:text-slate-300">
                Remark
              </Text>
              <Text size="sm" className="leading-relaxed text-slate-700 dark:text-slate-400">
                {declaration.remark}
              </Text>
            </CardContent>
          </Card>
        )}

        <Card className="mb-4">
          <CardContent className="p-4">
            <Text weight="semibold" size="sm" className="mb-3 text-slate-700 dark:text-slate-300">
              Timeline
            </Text>

            <TimelineRow
              icon="calendar-outline"
              label="Last Declaration"
              value={
                declaration.lastDeclarationDate
                  ? formattedDate(new Date(declaration.lastDeclarationDate))
                  : 'N/A'
              }
            />

            {declaration.reviewAt && (
              <>
                <TimelineRow
                  icon="person-outline"
                  label="Reviewed By"
                  value={declaration.reviewBy || 'N/A'}
                />
                <TimelineRow
                  icon="checkmark-circle-outline"
                  label="Reviewed At"
                  value={formattedDate(new Date(declaration.reviewAt))}
                />
              </>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </Container>
  );
}

const TimelineRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) => (
  <View className="mb-2 flex-row items-center gap-3">
    <View className="h-8 w-8 items-center justify-center bg-slate-100">
      <Ionicons name={icon} size={16} color="#64748b" />
    </View>
    <View className="flex-1">
      <Text variant="subtext" size="xs" className="text-slate-500">
        {label}
      </Text>
      <Text size="sm" weight="medium" className="text-slate-900 dark:text-white">
        {value}
      </Text>
    </View>
  </View>
);
