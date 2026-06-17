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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@src/shared/components/ui/card';
import { Container } from '@src/shared/components/common/container';
import { StackHeader } from '@src/shared/components/common/header/stack-header.component';
import { LoadingScreen } from '@src/shared/components/screens/loading';
import { ErrorScreen } from '@src/shared/components/screens/error-screen';
import { useMyDSARDetail } from '../hooks/use-dsar';
import { useCancelDSAR } from '../hooks/use-dsar-mutations';
import { DSARStatusBadge } from '../components/dsar-status-badge';
import { SLAIndicator } from '../components/sla-indicator';
import { DSARResponse } from '../types/dsar.types';
import { formatDate } from '@src/shared/utils/format';
import { cn } from '@src/shared/lib/cn';

export const MemberDSARDetailScreen = () => {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: detail, isLoading, isError, refetch, isRefetching } = useMyDSARDetail(ticketId);
  const { mutate: cancelRequest, isPending: isCancelling } = useCancelDSAR();
  const handleCancel = () => {
    cancelRequest(ticketId, {
      onSuccess: () => {
        setCancelOpen(false);
      },
      onError: () => {
        setCancelOpen(false);
      },
    });
  };

  const handleNewRequest = () => {
    router.push('/(protected)/profile/privacy/submit');
  };

  if (isLoading) {
    return (
      <Container>
        <StackHeader title="Request Details" showBackButton />
        <LoadingScreen message="Loading request details..." />
      </Container>
    );
  }

  if (isError || !detail) {
    return (
      <Container>
        <StackHeader title="Request Details" showBackButton />
        <ErrorScreen
          title="Failed to load request"
          message="There was an error loading this request. Please try again."
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  const responses = detail.responses || [];

  const ListHeader = () => (
    <View className="gap-y-4">
      <View className="mb-6 flex-row items-start justify-between">
        <View className="flex-1">
          <Text
            variant="subtext"
            size="xs"
            className="mb-1 font-bold uppercase tracking-widest text-slate-400">
            {detail.ticketNumber}
          </Text>
          <Text variant="heading" size="2xl" className="text-slate-900">
            {detail.requestType.charAt(0) + detail.requestType.slice(1).toLowerCase()} Request
          </Text>
        </View>
        <DSARStatusBadge status={detail.status} />
      </View>

      <SLAIndicator createdAt={detail.createdAt} className="mb-6" />

      <Card className="p-4">
        <CardHeader>
          <CardTitle className="font-semibold">Request Information</CardTitle>
          <CardDescription>Request Type</CardDescription>
        </CardHeader>
        <CardContent>
          <View className="mb-3">
            <Text className="text-slate-900">
              {detail.requestType === 'ACCESS'
                ? 'Access My Data'
                : detail.requestType === 'CORRECTION'
                  ? 'Correct My Data'
                  : detail.requestType === 'DELETION'
                    ? 'Delete My Data'
                    : 'Port My Data'}
            </Text>
          </View>

          <View className="mb-3">
            <Text variant="subtext" size="xs" className="mb-1 font-medium text-slate-500">
              Data Categories
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {detail.requestedData.map((cat) => (
                <View key={cat} className="bg-indigo-50 px-3 py-1">
                  <Text size="xs" className="text-indigo-700">
                    {cat.replace(/_/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {detail.description && (
            <View>
              <Text variant="subtext" size="xs" className="mb-1 font-medium text-slate-500">
                Description
              </Text>
              <Text size="sm" className="leading-relaxed text-slate-700">
                {detail.description}
              </Text>
            </View>
          )}
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader>
          <CardTitle className="font-semibold">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineRow icon="time-outline" label="Requested" value={formatDate(detail.createdAt)} />
          <TimelineRow
            icon="alarm-outline"
            label="Response Deadline"
            value={formatDate(detail.responseDeadline)}
          />
          {detail.completedAt && (
            <TimelineRow
              icon="checkmark-circle-outline"
              label="Completed"
              value={formatDate(detail.completedAt)}
            />
          )}
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader>
          <CardTitle className="font-semibold ">Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.assignedTo ? (
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center bg-indigo-100">
                <Text weight="bold" size="sm" className="text-indigo-700">
                  {detail?.assignedTo?.name?.charAt(0).toUpperCase()}
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
          ) : (
            <Text variant="subtext" size="sm">
              Not yet assigned
            </Text>
          )}
        </CardContent>
      </Card>

      {(detail.status === 'COMPLETED' || detail.status === 'REJECTED') && (
        <Card className="p-4">
          <CardHeader>
            <CardTitle
              className={cn(
                'mb-0',
                detail.status === 'REJECTED' ? 'text-red-700' : 'text-green-700'
              )}>
              {detail.status === 'REJECTED' ? 'Resolution' : 'Completion Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-y-3">
            {detail.status === 'REJECTED' && detail.rejectedReason && (
              <View>
                <Text variant="subtext" size="xs" weight={'medium'} className="mb-1">
                  Reason for Rejection
                </Text>
                <Text size="sm" className="leading-relaxed text-slate-700">
                  {detail.rejectedReason}
                </Text>
              </View>
            )}

            {detail.notes && (
              <View className={detail.rejectedReason ? '' : ''}>
                <Text variant="subtext" size="xs" className="mb-1 font-medium text-slate-500">
                  Admin Notes
                </Text>
                <Text size="sm" className="leading-relaxed text-slate-700">
                  {detail.notes}
                </Text>
              </View>
            )}
          </CardContent>
        </Card>
      )}
    </View>
  );

  const ListFooter = () => (
    <View className="mt-4 gap-3 pb-8">
      {detail.status === 'PENDING' && (
        <Button variant="destructive" onPress={() => setCancelOpen(true)} disabled={isCancelling}>
          {isCancelling ? 'Cancelling...' : 'Cancel Request'}
        </Button>
      )}
      <Button variant="outline" onPress={handleNewRequest}>
        Submit New Request
      </Button>
    </View>
  );

  return (
    <Container>
      <StackHeader title="Request Details" showBackButton />

      <FlashList
        data={responses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ResponseCard response={item} />}
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
              Awaiting admin response to your request.
            </Text>
          </View>
        }
      />

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this data access request? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setCancelOpen(false)} />
            <AlertDialogAction variant="destructive" onPress={handleCancel}>
              Yes, Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

const TimelineRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View className="mb-2 flex-row items-center gap-3">
    <View className="h-8 w-8 items-center justify-center bg-slate-100">
      <Ionicons name={icon as any} size={16} color="#64748b" />
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

const ResponseCard = ({ response }: { response: DSARResponse }) => (
  <Card className="my-3">
    <CardContent className="p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text weight="semibold" size="sm" className="text-slate-900">
          {response.responseType || 'Response'}
        </Text>
        <Text variant="subtext" size="xs" className="text-slate-400">
          {formatDate(response.createdAt)}
        </Text>
      </View>

      {response.notes && (
        <Text size="sm" className="mb-2 leading-relaxed text-slate-700">
          {response.notes}
        </Text>
      )}

      <View className="flex-row gap-4">
        <View className="flex-row items-center gap-1">
          <Ionicons name="arrow-forward-circle-outline" size={14} color="#64748b" />
          <Text variant="subtext" size="xs">
            {response.deliveryMethod.replace(/_/g, ' ')}
          </Text>
        </View>
        {response.deliveredAt && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
            <Text variant="subtext" size="xs">
              Delivered
            </Text>
          </View>
        )}
      </View>
    </CardContent>
  </Card>
);
