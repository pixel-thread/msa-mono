import React from 'react';
import { View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMeeting } from '../hooks';
import { EmptyScreen, ErrorScreen, LoadingScreen } from '@src/shared/components/screens';
import { Container, StackHeader } from '@src/shared/components';
import {
  Card,
  CardContent,
  Text,
  Button,
  Alert,
  AlertTitle,
  CardHeader,
  CardTitle,
} from '@src/shared/components/ui';
import { formattedDate, formattedTime } from '@src/shared/utils/format';
import { cn } from '@lib/cn';
import { useMeetingAttendees } from '../hooks/useMeetingAttendees';
import { useMeetingAgenda } from '../hooks/useMeetingAgenda';
import { useUpdateAttendeeRsvp } from '../hooks/use-update-attendee-rsvp';
import { useAuthStore } from '@src/features/auth';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@repo/shared';
import { MeetingInfoCard } from '../components/meeting-info-card';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const getRsvpStatusStyle = (status: string) => {
  switch (status) {
    case 'ACCEPTED':
      return { dot: 'bg-emerald-500', text: 'text-emerald-500', label: 'Accepted' };
    case 'DECLINED':
      return { dot: 'bg-red-500', text: 'text-red-500', label: 'Declined' };
    case 'TENTATIVE':
      return { dot: 'bg-slate-400', text: 'text-slate-400', label: 'Tentative' };
    default:
      return { dot: 'bg-slate-400', text: 'text-slate-400', label: 'Pending' };
  }
};

const getMeetingStatusStyle = (status: string) => {
  switch (status) {
    case 'SCHEDULED':
      return { dot: 'bg-emerald-500', text: 'text-emerald-500', label: 'Scheduled' };
    case 'IN_PROGRESS':
      return { dot: 'bg-blue-500', text: 'text-blue-500', label: 'In Progress' };
    case 'COMPLETED':
      return { dot: 'bg-slate-400', text: 'text-slate-400', label: 'Completed' };
    default:
      return { dot: 'bg-slate-400', text: 'text-slate-400', label: 'Cancelled' };
  }
};

export const MeetingDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: meeting, isLoading, isError, refetch, isRefetching } = useMeeting(id as string);
  const { data: attendees = [] } = useMeetingAttendees(id as string);
  const { data: agenda = [] } = useMeetingAgenda(id as string);

  const isMeetingOver24Hour =
    !!meeting?.createdAt && Date.now() - new Date(meeting.createdAt).getTime() > ONE_DAY_MS;
  const { mutate: updateRsvp, isPending: isUpdatingRsvp } = useUpdateAttendeeRsvp({
    meetingId: id as string,
  });

  const isAttendee =
    attendees?.find((a) => a.userId === user?.id) || attendees?.find((a) => a.user.id === user?.id);

  const userRsvp = attendees?.find((a) => a.user.id === user?.id);

  const isAccepted = userRsvp?.rsvpStatus === 'ACCEPTED';
  const isDeclined = userRsvp?.rsvpStatus === 'DECLINED';

  const handleRsvp = (status: 'ACCEPTED' | 'DECLINED') => {
    updateRsvp(
      { status: status },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.MEETINGS_KEYS.ATTENDEES(id as string),
          });
        },
      }
    );
  };

  if (isLoading)
    return (
      <>
        <StackHeader title="Loading" showBackButton />
        <LoadingScreen message="Fetching meeting" />
      </>
    );

  if (!meeting) {
    return (
      <>
        <StackHeader title="Meeting Not Found" showBackButton />
        <EmptyScreen
          title="Meeting Not Found"
          description="The meeting you are looking for was not found."
          refresh={refetch}
        />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <StackHeader title="Error" showBackButton />
        <ErrorScreen />
      </>
    );
  }

  const date = new Date(meeting?.scheduledAt);

  return (
    <Container>
      <StackHeader
        title={meeting.title}
        showBackButton
        rightAction={
          <Pressable
            onPress={() => router.push(`/meetings/${meeting.id}/minutes`)}
            accessibilityLabel="View minutes"
            accessibilityHint="Opens the meeting minutes for this meeting">
            <Ionicons name="document-text-outline" size={24} color="#6366f1" />
          </Pressable>
        }
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }>
        {/* Hero Section */}
        <View className="px-4 pb-8 pt-6">
          <View className="flex-row flex-wrap items-center gap-x-3">
            <Text
              variant="heading"
              size="3xl"
              selectable
              className="text-slate-900 dark:text-white">
              {meeting.title}
            </Text>
            <View className="flex-row items-center gap-x-1.5">
              <View
                className={cn('h-2 w-2 rounded-full', getMeetingStatusStyle(meeting.status).dot)}
              />
              <Text
                className={getMeetingStatusStyle(meeting.status).text}
                variant="subtext"
                size="sm">
                {getMeetingStatusStyle(meeting.status).label}
              </Text>
            </View>
          </View>

          {meeting.description && (
            <Text
              variant="subtext"
              size="sm"
              selectable
              className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
              {meeting.description}
            </Text>
          )}
        </View>

        {/* Quick Info Grid */}
        <View className="flex-1 flex-row flex-wrap gap-4 px-4">
          <MeetingInfoCard
            icon="calendar"
            label="Date"
            value={formattedDate(date)}
            className="min-w-[45%] flex-1"
          />
          <MeetingInfoCard
            icon="time"
            label="Time"
            value={formattedTime(date)}
            className="min-w-[45%] flex-1"
          />
          <MeetingInfoCard
            icon="location"
            label="Location"
            value={meeting.venue || 'To be announced'}
            className="w-[45%]"
          />
        </View>

        {!isMeetingOver24Hour && isAttendee && (
          <View className="mt-10 gap-2 px-4 pb-2">
            <Alert variant={'destructive'}>
              <AlertTitle>
                Attendance is mandatory for all committee members. Please RSVP by 24h prior.
              </AlertTitle>
            </Alert>

            <View className="flex-row justify-evenly">
              <Button
                variant={isDeclined ? 'outline' : 'default'}
                loading={isUpdatingRsvp}
                disabled={isUpdatingRsvp}
                onPress={() => handleRsvp('ACCEPTED')}
                accessibilityLabel={isAccepted ? 'Confirmed attendance' : 'Confirm attendance'}
                accessibilityHint="Marks you as attending this meeting"
                className="mx-1 h-14 w-1/2">
                {isAccepted ? 'Confirmed' : 'Confirm Attendance'}
              </Button>
              <Button
                variant={isAccepted ? 'outline' : 'default'}
                loading={isUpdatingRsvp}
                disabled={isUpdatingRsvp}
                onPress={() => handleRsvp('DECLINED')}
                accessibilityLabel={isDeclined ? 'Declined attendance' : 'Decline attendance'}
                accessibilityHint="Marks you as unable to attend this meeting"
                className="mx-1 h-14 w-1/2">
                Unable to Attend
              </Button>
            </View>
            <View className="mt-8 items-center">
              <Text variant="subtext" size="xs" selectable className="opacity-50">
                Reference ID: {meeting.id.toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {/* Agenda Section */}
        {agenda && agenda.length > 0 && (
          <View className="mt-8 px-4">
            <Card>
              <CardHeader>
                <CardTitle accessibilityRole="header">Order of Business</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {agenda
                  .sort((a, b) => a.order - b.order)
                  ?.map((item, index) => (
                    <View
                      key={index}
                      className={cn(
                        'flex-1 flex-col gap-x-4 p-4',
                        index !== agenda.length - 1 &&
                          'border-b border-slate-100 dark:border-slate-800'
                      )}>
                      <View className="flex-row items-start gap-x-3">
                        <View className="pt-0.5">
                          <Text size="sm" weight="bold">
                            {String(index + 1).padStart(2, '0')}.
                          </Text>
                        </View>
                        <View className="flex-1 gap-2">
                          <Text weight="semibold" selectable className="leading-tight">
                            {item.title}
                          </Text>
                          {item.description && (
                            <Text variant="subtext" selectable className="leading-tight">
                              {item.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
              </CardContent>
            </Card>
          </View>
        )}

        {/* Attendees Section */}
        <View className="mt-8 px-4">
          <Text
            variant="heading"
            size="lg"
            accessibilityRole="header"
            className="mb-4 px-1 text-slate-900 dark:text-white">
            Attendance
          </Text>
          <Card>
            <CardContent className="p-0">
              {attendees?.map((attendee, index) => {
                const rsvpStyle = getRsvpStatusStyle(attendee.rsvpStatus);
                return (
                  <View
                    key={index}
                    accessibilityLabel={`${attendee.user.name}, ${attendee.attendeeRole}, ${rsvpStyle.label}`}
                    className={cn(
                      'flex-row items-center px-4 py-3',
                      index !== attendees.length - 1 &&
                        'border-b border-slate-100 dark:border-slate-800'
                    )}>
                    <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <Text size="sm" weight="bold" className="text-slate-900 dark:text-slate-100">
                        {attendee.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        weight="semibold"
                        size="sm"
                        className="text-slate-900 dark:text-slate-100">
                        {attendee.user.name}
                      </Text>
                      <Text variant="subtext" size="xs" className="text-slate-500">
                        {attendee.attendeeRole}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-x-1">
                      <View className={cn('h-2 w-2 rounded-full', rsvpStyle.dot)} />
                      <Text variant="subtext" size="xs" className={rsvpStyle.text}>
                        {rsvpStyle.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </CardContent>
          </Card>
        </View>

        {/* Organizer Section */}
        <View className="mt-6 px-4">
          <View className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <View className="flex-row items-center gap-x-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <Text weight="bold" className="text-slate-900 dark:text-slate-100">
                  {meeting.createdBy.name?.charAt(0) ||
                    meeting.createdBy.email.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text weight="semibold" size="sm" className="text-slate-900 dark:text-slate-100">
                  {meeting.createdBy.name || 'Administrative Office'}
                </Text>
                <Text variant="subtext" size="xs" selectable className="text-slate-500">
                  {meeting.createdBy.email}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};
