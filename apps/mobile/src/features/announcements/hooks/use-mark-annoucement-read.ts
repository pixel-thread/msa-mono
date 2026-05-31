import http from '@src/shared/utils/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementEndpoints } from '../utils/constants/endpoints';
import { AnnouncementQueryKeys } from '../utils/constants/query-key';

export function useMarkAnnouncementRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      http.post<{ id: string }>(announcementEndpoints.markReadAnnouncement(id)),
    onSuccess: (data) => {
      if (data.success) {
        if (data?.data?.id) {
          client.invalidateQueries({ queryKey: AnnouncementQueryKeys.detail(data?.data?.id) });
        }
        client.invalidateQueries({ queryKey: AnnouncementQueryKeys.all() });
      }
    },
  });
}
