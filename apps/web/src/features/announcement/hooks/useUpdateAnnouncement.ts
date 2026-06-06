import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import type { UpdateAnnouncementInput } from '../validators';
import { ENDPOINTS } from '@repo/shared';

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementInput }) =>
      http.put(ENDPOINTS.ANNOUNCEMENTS.DETAILS(id), data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Announcement updated successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.LISTS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to update announcement');
    },
  });
}
