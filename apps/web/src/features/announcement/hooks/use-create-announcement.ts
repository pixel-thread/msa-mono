import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { CreateAnnouncementInput } from '../validators';

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) => http.post(ENDPOINTS.ANNOUNCEMENTS.LIST, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.LISTS() });
        return;
      }
    },
    onError: () => {
      toast.error('Failed to create announcement');
    },
  });
}
