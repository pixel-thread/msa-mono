import { useInfiniteQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Announcement } from '../types';
import { useAuthStore } from '@src/shared/store';
import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';

export const useAnnouncements = () => {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.ANNOUNCEMENTS_KEYS.ALL(),

    queryFn: ({ pageParam }) =>
      http.get<Announcement[]>(
        buildUrlWithQuery(ENDPOINTS.ANNOUNCEMENTS.LIST, { page: pageParam })
      ),

    initialPageParam: 1,

    enabled: isAuthenticated,

    getNextPageParam: (nextPage) => {
      if (!nextPage.meta?.hasMore) {
        return undefined;
      }

      return nextPage.meta.page + 1;
    },

    getPreviousPageParam: (prev) => {
      if (!prev.meta || prev.meta.page <= 1) {
        return undefined;
      }

      return prev.meta.page - 1;
    },
    select: (res) => {
      return res.pages.flatMap((page) => page.data ?? []);
    },
  });
};
