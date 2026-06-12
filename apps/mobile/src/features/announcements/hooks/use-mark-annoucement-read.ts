import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';

export function useMarkAnnouncementRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.post<{ id: string }>(ENDPOINTS.ANNOUNCEMENTS.READ(id)),
    onSuccess: (data) => {
      if (data.success) {
        if (data?.data?.id) {
          client.invalidateQueries({
            queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.DETAIL(data?.data?.id),
          });
        }
        client.invalidateQueries({ queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.ALL() });
      }
    },
  });
}
