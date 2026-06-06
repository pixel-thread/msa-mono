import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { announcementEndpoints } from '../utils/constants/endpoints';

export function useMarkAnnouncementRead(announcementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => http.post(announcementEndpoints.read(announcementId)),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Announcement marked as read');
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.DETAIL(announcementId),
        });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.LISTS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to mark announcement as read');
    },
  });
}
