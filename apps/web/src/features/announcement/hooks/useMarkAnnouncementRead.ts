import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { ENDPOINTS } from '@repo/shared';

export function useMarkAnnouncementRead(announcementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => http.post(ENDPOINTS.ANNOUNCEMENTS.READ(announcementId)),
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
