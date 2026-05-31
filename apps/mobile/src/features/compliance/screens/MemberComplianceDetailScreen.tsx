import React, { useState } from 'react';
import { View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@src/shared/components/ui/alert-dialog';
import { Text } from '@src/shared/components/ui/text';
import { Button } from '@src/shared/components/ui/button';
import { Card, CardContent } from '@src/shared/components/ui/card';
import { Container } from '@src/shared/components/common/Container';
import { StackHeader } from '@src/shared/components/common/header/stack-header.component';
import { LoadingScreen } from '@src/shared/components/screens/loading';
import { ErrorScreen } from '@src/shared/components/screens/error-screen';
import { useMyComplianceDetail } from '../hooks/use-compliance-detail';
import { useCancelCompliance } from '../hooks/use-compliance-mutations';
import { ComplianceStatusBadge } from '../components/ComplianceStatusBadge';
import { ComplianceResponseCard } from '../components/ComplianceResponseCard';
import { formatDate } from '@src/shared/utils/format';

export const MemberComplianceDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: detail, isLoading, isError, refetch, isRefetching } = useMyComplianceDetail(id);
  const { mutate: cancelCompliance, isPending: isCancelling } = useCancelCompliance();

  const handleCancel = () => {
    cancelCompliance(id, {
      onSuccess: () => {
        setCancelOpen(false);
      },
      onError: () => {
        setCancelOpen(false);
      },
    });
  };

  const handleNewCompliance = () => {
    router.push('/(protected)/compliance/submit');
  };

  if (isLoading) {
    return (
      <Container>
        <StackHeader title="Compliance Details" showBackButton />
        <LoadingScreen message="Loading compliance details..." />
      </Container>
    );
  }

  if (isError || !detail) {
    return (
      <Container>
        <StackHeader title="Compliance Details" showBackButton />
        <ErrorScreen
          title="Failed to load compliance"
          message="There was an error loading this compliance. Please try again."
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  const responses = detail.responses || [];

  const ListHeader = () => (
    <View>
      <View className="mb-6 flex-row items-start justify-between">
        <View className="flex-1">
          <Text
            variant="subtext"
            size="xs"
            className="mb-1 font-bold uppercase tracking-widest text-slate-400">
            {detail.ticketNumber}
          </Text>
          <Text variant="heading" size="2xl" className="text-slate-900">
            {detail.subject}
          </Text>
        </View>
        <ComplianceStatusBadge status={detail.status} />
      </View>

      <Card className="mb-4">
        <CardContent className="p-4">
          <Text weight="semibold" size="sm" className="mb-3 text-slate-700">
            Compliance Information
          </Text>

          <View className="mb-3 flex-row gap-4">
            <View className="flex-1">
              <Text variant="subtext" size="xs" className="mb-1 font-medium text-slate-500">
                Category
              </Text>
              <Text className="text-slate-900">{detail?.category?.replace(/_/g, ' ')}</Text>
            </View>
            <View className="flex-1">
              <Text variant="subtext" size="xs" className="mb-1 font-medium text-slate-500">
                Priority
              </Text>
              <Text className="text-slate-900">{detail.priority}</Text>
            </View>
          </View>

          <View className="mb-3">
            <Text variant="subtext" size="xs" className="mb-1 font-medium text-slate-500">
              Description
            </Text>
            <Text size="sm" className="leading-relaxed text-slate-700">
              {detail.description}
            </Text>
          </View>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <Text weight="semibold" size="sm" className="mb-3 text-slate-700">
            Timeline
          </Text>

          <TimelineRow icon="time-outline" label="Submitted" value={formatDate(detail.createdAt)} />
          <TimelineRow
            icon="refresh-outline"
            label="Last Updated"
            value={formatDate(detail.updatedAt)}
          />
          {detail.resolvedAt && (
            <TimelineRow
              icon="checkmark-circle-outline"
              label="Resolved"
              value={formatDate(detail.resolvedAt)}
            />
          )}
        </CardContent>
      </Card>

      {detail.assignedTo && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <Text weight="semibold" size="sm" className="mb-3 text-slate-700">
              Assigned To
            </Text>
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center bg-indigo-100">
                <Text weight="bold" size="sm" className="text-indigo-700">
                  {detail.assignedTo.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text size="sm" weight="medium" className="text-slate-900">
                  {detail.assignedTo.name}
                </Text>
                <Text variant="subtext" size="xs">
                  {detail.assignedTo.email}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      )}

      <Text weight="semibold" size="sm" className="mb-3 px-1 text-slate-700">
        Responses
      </Text>
    </View>
  );

  const ListFooter = () => (
    <View className="mt-4 gap-3 pb-8">
      {detail.status === 'PENDING' && (
        <Button variant="destructive" onPress={() => setCancelOpen(true)} disabled={isCancelling}>
          {isCancelling ? 'Cancelling...' : 'Cancel Compliance'}
        </Button>
      )}
      <Button variant="outline" onPress={handleNewCompliance}>
        Submit New Compliance
      </Button>
    </View>
  );

  return (
    <Container>
      <StackHeader title="Compliance Details" showBackButton />

      <FlashList
        data={responses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ComplianceResponseCard response={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          <View className="items-center py-12">
            <View className="mb-4 bg-slate-100 p-5">
              <Ionicons name="chatbubble-ellipses-outline" size={36} color="#94A3B8" />
            </View>
            <Text weight="medium" className="mb-1 text-center text-slate-600">
              No responses yet
            </Text>
            <Text variant="subtext" size="sm" className="text-center">
              Your compliance is being reviewed. Responses will appear here.
            </Text>
          </View>
        }
      />

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Compliance?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this compliance? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setCancelOpen(false)} />
            <AlertDialogAction variant="destructive" onPress={handleCancel}>
              Yes, Cancel Compliance
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

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
      <Text size="sm" weight="medium" className="text-slate-900">
        {value}
      </Text>
    </View>
  </View>
);
