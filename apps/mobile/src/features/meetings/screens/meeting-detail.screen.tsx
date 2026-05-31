import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
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
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
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
import { MeetingQueryKeys } from '../utils/constants/query-key';
import { MeetingInfoCard } from '../components/meeting-info-card';
import { IconWithBadge } from '@src/shared/components/common';
import { truncateText } from '@src/shared/utils';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
          queryClient.invalidateQueries({ queryKey: MeetingQueryKeys.attendees(id as string) });
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
        title={truncateText({ text: meeting.title })}
        showBackButton
        rightAction={
          <View className="flex-row gap-x-2">
            <IconWithBadge
              onPress={() => router.push(`/meetings/${meeting.id}/minutes`)}
              name="document-text-outline"
              showBadge={false}
            />
          </View>
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
          <View className="mb-3 flex-row items-center gap-x-2"></View>

          <Text variant="heading" size="3xl" className="text-slate-900 dark:text-white">
            {meeting.title}
          </Text>

          {meeting.description && (
            <Text
              variant="subtext"
              size="sm"
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
                loading={isUpdatingRsvp}
                disabled={isUpdatingRsvp || isAccepted}
                onPress={() => handleRsvp('ACCEPTED')}
                className="mx-1 h-14 w-1/2">
                {attendees?.some((a) => a.user.id === user?.id && a.rsvpStatus !== 'PENDING')
                  ? 'Update RSVP'
                  : 'Confirm Attendance'}
              </Button>
              <Button
                variant="outline"
                loading={isUpdatingRsvp}
                disabled={isUpdatingRsvp || isDeclined}
                onPress={() => handleRsvp('DECLINED')}
                className="mx-1 h-14 w-1/2">
                Unable to Attend
              </Button>
            </View>
            <View className="mt-8 items-center">
              <Text variant="subtext" size="xs" className="opacity-50">
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
                <CardTitle>Order of Business</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {agenda?.map((item, index) => (
                  <View
                    key={index}
                    className={cn(
                      'flex-1 flex-col gap-x-4 p-4',
                      index !== agenda.length - 1 &&
                        'border-b border-slate-100 dark:border-slate-800'
                    )}>
                    <View className="flex-row items-start gap-x-3">
                      <View className="pt-0.5">
                        <Text size="sm" weight="bold" className="text-slate-400">
                          {String(index + 1).padStart(2, '0')}.
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold leading-tight text-slate-900 dark:text-slate-100">
                          {item.title}
                        </Text>
                        {item.description && (
                          <Text className="mt-1 leading-tight text-slate-600 dark:text-slate-400">
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

        {/* Personnel Section */}
        <View className="mt-8 px-4">
          <Text variant="heading" size="lg" className="mb-4 px-1 text-slate-900 dark:text-white">
            Attendance
          </Text>
          <Card className="border-slate-200 bg-white shadow-none dark:border-slate-700 dark:bg-slate-900">
            <Accordion className="px-4">
              <AccordionItem value="attendees">
                <AccordionTrigger>
                  <Text>Registered Attendees</Text>
                </AccordionTrigger>
                <AccordionContent>
                  {attendees?.map((attendee, index) => (
                    <View key={index} className="flex-row items-center justify-between py-2">
                      <View className="flex-row items-center gap-x-3">
                        <View className="w-8 items-center justify-center">
                          <Text size="sm" weight="bold" className="text-slate-400">
                            {String(index + 1).padStart(2, '0')}.
                          </Text>
                        </View>
                        <Text className="flex-1 font-medium leading-tight text-slate-900 dark:text-slate-100">
                          {attendee.user.name}
                        </Text>
                        <Text className="flex-1 font-medium leading-tight text-slate-900 dark:text-slate-100">
                          {attendee.attendeeRole}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-x-3">
                        <Text variant={'heading'}>{attendee.rsvpStatus}</Text>
                      </View>
                    </View>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="organizer" className="border-b-0">
                <AccordionTrigger>
                  <View className="flex-row items-center gap-x-3">
                    <Ionicons name="ribbon-outline" size={20} color="#6366f1" />
                    <Text weight="medium">Institutional Lead</Text>
                  </View>
                </AccordionTrigger>
                <AccordionContent>
                  <View className="flex-row items-center gap-x-3 py-2">
                    <View className="h-10 w-10 items-center justify-center bg-slate-100 dark:bg-slate-800">
                      <Text weight="bold" className="text-slate-900 dark:text-slate-100">
                        {meeting.createdBy.name?.charAt(0) ||
                          meeting.createdBy.email.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text
                        weight="semibold"
                        size="sm"
                        className="text-slate-900 dark:text-slate-100">
                        {meeting.createdBy.name || 'Administrative Office'}
                      </Text>
                      <Text variant="subtext" size="xs" className="text-slate-500">
                        {meeting.createdBy.email}
                      </Text>
                    </View>
                  </View>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </View>

        {/* Action Bar */}
      </ScrollView>
    </Container>
  );
};
