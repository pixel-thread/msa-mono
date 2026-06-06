import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Announcement } from '../types';
import { useAuthStore } from '@src/shared/store';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';

export const useAnnouncements = () => {
  const { isAuthenticated } = useAuthStore();

  const query = useQuery({
    queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.ALL(),
    queryFn: async () => http.get<Announcement[]>(ENDPOINTS.ANNOUNCEMENTS.ROOT),
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

