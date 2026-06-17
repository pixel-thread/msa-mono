import { QUERY_KEYS } from '@repo/shared';
import { ENDPOINTS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => http.delete(ENDPOINTS.ANNOUNCEMENTS.DETAILS(id)),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Announcement deleted successfully');
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.LISTS() });
        return;
      }
      toast.error(data.message);
    },
    onError: () => {
      toast.error('Failed to delete announcement');
    },
  });
}
