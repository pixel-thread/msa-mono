'use client';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { meetingsEndpoints } from '../utils/constants/endpoints';
import type { Attendee } from '../types';

/**
 * Hook to manage meeting attendees.
 * Handles fetching, adding, and removing attendees for a specific meeting.
 *
 * @param meetingId - The ID of the meeting to manage attendees for.
 */
export function useMeetingAttendees(meetingId: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: QUERY_KEYS.MEETINGS_KEYS.ATTENDEES(meetingId),
    enabled: !!meetingId,
    queryFn: async () =>
      http.get<Attendee[]>(meetingsEndpoints.attendees.base(meetingId as string)),
    select: (data) => data.data,
  });

  const addAttendeeMutation = useMutation({
    mutationFn: async ({
      meetingId,
      userId,
      attendeeRole,
    }: {
      meetingId: string;
      userId: string;
      attendeeRole: string;
    }) =>
      http.post(meetingsEndpoints.attendees.base(meetingId), {
        userId,
        attendeeRole,
      }),
    onSuccess: (data) => {
      if (data.success) {
        refetch();
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.LISTS() });
        toast.success('Attendee added successfully');
        return data;
      }
      toast.error(data.message);
      return data;
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add attendee');
    },
  });

  const removeAttendeeMutation = useMutation({
    mutationFn: async ({ meetingId, userId }: { meetingId: string; userId: string }) =>
      http.delete(meetingsEndpoints.attendees.byId(meetingId, userId)),
    onSuccess: (data) => {
      if (data.success) {
        refetch();
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.LISTS() });
        toast.success('Attendee removed successfully');
        return data;
      }
      toast.error(data.message);
      return data;
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove attendee');
    },
  });

  return {
    attendees: data ?? [],
    isLoading: isLoading || isFetching,
    refetch,
    addAttendee: addAttendeeMutation.mutate,
    removeAttendee: removeAttendeeMutation.mutate,
    isAdding: addAttendeeMutation.isPending,
    isRemoving: removeAttendeeMutation.isPending,
  };
}
