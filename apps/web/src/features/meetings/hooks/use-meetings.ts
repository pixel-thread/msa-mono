import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import type { PaginationMeta } from '@src/shared/types/api.types';
import http from '@src/shared/utils/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { Meeting } from '../types';
import type { CreateMeetingInput } from '../validators';

interface UseMeetingsOptions {
  options?: {
    search?: string;
  };
  page?: number;
}

export function useMeetings({ options: filter = { search: '' }, page }: UseMeetingsOptions = {}) {
  const { search } = filter;

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.MEETINGS_KEYS.LIST(search, page),
    queryFn: async () =>
      http.get<Meeting[]>(buildUrlWithQuery(ENDPOINTS.MEETINGS.LIST, { page, search })),
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
