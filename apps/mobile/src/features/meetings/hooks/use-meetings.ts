import { useInfiniteQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import type { Meeting } from '../types';
import { useAuthStore } from '@src/shared/store';
import { QUERY_KEYS, ENDPOINTS, buildUrlWithQuery } from '@repo/shared';

type UseMeetingsParams = {
  type?: string;
  status?: string;
  limit?: number;
};

export const useMeetings = (params?: UseMeetingsParams) => {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.MEETINGS_KEYS.LIST(),
    initialPageParam: 1,
    enabled: isAuthenticated,
    queryFn: async ({ pageParam }) => {
      return http.get<Meeting[]>(
        buildUrlWithQuery(ENDPOINTS.MEETINGS.LIST, { page: pageParam, ...params })
      );
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) {
        return undefined;
      }

      return lastPage.meta.page + 1;
    },

    getPreviousPageParam: (firstPage) => {
      if (!firstPage.meta || firstPage.meta.page <= 1) {
        return undefined;
      }

      return firstPage.meta.page - 1;
    },

    select: (data) => {
      const allMeetings = data.pages.flatMap((page) => page.data ?? []);

      // Filter out duplicates based on 'id'
      const uniqueMeetings = allMeetings.filter(
        (meeting, index, self) => self.findIndex((m) => m.id === meeting.id) === index
      );

      return {
        meetings: uniqueMeetings,
        meta: data.pages[data.pages.length - 1]?.meta,
      };
    },
  });
};
