import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import type { CreateAnnouncementInput } from '../validators';
import { announcementEndpoints } from '../utils/constants/endpoints';

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) => http.post(announcementEndpoints.base, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Announcement created successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.LISTS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to create announcement');
    },
  });
}
