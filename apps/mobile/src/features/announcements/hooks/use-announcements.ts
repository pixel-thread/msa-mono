import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Announcement } from '../types';
import { useAuthStore } from '@src/shared/store';
import { announcementEndpoints } from '../utils/constants/endpoints';
import { AnnouncementQueryKeys } from '../utils/constants/query-key';

export const useAnnouncements = () => {
  const { isAuthenticated } = useAuthStore();

  const query = useQuery({
    queryKey: AnnouncementQueryKeys.all(),
    queryFn: async () => http.get<Announcement[]>(announcementEndpoints.list),
    enabled: isAuthenticated,
  });

  const data = query.data?.data;

  const meta = query.data?.meta;

  return {
    ...query,
    data: data,
    meta: meta,
  };
};

