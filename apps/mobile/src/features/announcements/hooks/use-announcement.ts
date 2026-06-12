import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Announcement } from '../types';
import { useAuthStore } from '@src/shared/store';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';

export const useAnnouncement = (id: string) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.DETAIL(id),
    select: (data) => data?.data,
    queryFn: async () => http.get<Announcement>(ENDPOINTS.ANNOUNCEMENTS.DETAILS(id)),
    enabled: isAuthenticated && !!id,
  });
};
