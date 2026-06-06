import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Announcement } from '../types';
import { useAuthStore } from '@src/shared/store';
import { announcementEndpoints } from '../utils/constants/endpoints';
import { QUERY_KEYS } from '@repo/shared';

export const useAnnouncement = (id: string) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.DETAIL(id),
    select: (data) => data?.data,
    queryFn: async () => http.get<Announcement>(announcementEndpoints.detail(id)),
    enabled: isAuthenticated && !!id,
  });
};