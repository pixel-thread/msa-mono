import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, buildUrlWithQuery, QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import type { Meeting, Attendee } from '../types';
import type { CreateMeetingInput } from '../validators';
import type { PaginationMeta } from '@src/shared/types/api.types';

interface UseMeetingsOptions {
  page?: number;
}

export function useMeetings(options: UseMeetingsOptions = {}) {
  const { page = 1 } = options;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.MEETINGS_KEYS.LIST(page),
    queryFn: async () => http.get<Meeting[]>(buildUrlWithQuery(ENDPOINTS.MEETINGS.LIST, { page })),
  });

  const createMeetingMutation = useMutation({
    mutationFn: (data: CreateMeetingInput) => http.post<Meeting>(ENDPOINTS.MEETINGS.LIST, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.LISTS() });
        toast.success('Meeting created successfully');
        return data;
      }
      toast.error(data.message);
      return data;
    },
  });

  const deleteMeetingMutation = useMutation({
    mutationFn: async (meetingId: string) => {
      const res = await http.delete(ENDPOINTS.MEETINGS.DETAIL(meetingId));
      if (!res.success) throw new Error(res.message);
      return res;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.LISTS() });
        toast.success('Meeting deleted successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete meeting');
    },
  });

  return {
    meetings: data?.data ?? [],
    meta: data?.meta as PaginationMeta | undefined,
    isLoading,
    error,
    createMeeting: createMeetingMutation.mutate,
    deleteMeeting: deleteMeetingMutation.mutate,
    isCreating: createMeetingMutation.isPending,
    isDeleting: deleteMeetingMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEETINGS_KEYS.LISTS() }),
  };
}
