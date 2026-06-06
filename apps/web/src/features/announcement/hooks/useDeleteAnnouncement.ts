import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { ENDPOINTS } from '@repo/shared';

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
