'use client';

import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAssignAttendee(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, attendeeRole }: { userId: string; attendeeRole: string }) => {
      const res = await http.post(ENDPOINTS.MEETINGS.ATTENDEES.LIST(meetingId), {
        userId,
        attendeeRole,
      });
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.DETAIL(meetingId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.LISTS() });
      toast.success('Attendee added successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add attendee');
    },
  });
}

export function useRemoveAttendee(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await http.delete(ENDPOINTS.MEETINGS.ATTENDEES.DETAIL(meetingId, userId));
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.DETAIL(meetingId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.LISTS() });
      toast.success('Attendee removed successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove attendee');
    },
  });
}
