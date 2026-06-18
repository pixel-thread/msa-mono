import { useInfiniteQuery } from '@tanstack/react-query';
import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { ContributionPeriod } from '../types';
import { useAuthStore } from '@src/shared/store';

export const useMyContributions = (status: string) => {
  const { isAuthenticated } = useAuthStore();

  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.LIST(status),
    initialPageParam: 1,
    enabled: isAuthenticated,
    queryFn: async ({ pageParam }) => {
      return http.get<ContributionPeriod>(
        buildUrlWithQuery(ENDPOINTS.CONTRIBUTION.MY, { page: pageParam, status })
      );
    },

    retryOnMount: false,

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

    select: (data) => {
      const contributions = data.pages.flatMap((page) => page.data ?? []);
      return {
        contributions,
        meta: data.pages[data.pages.length - 1]?.meta,
      };
    },
  });

  return {
    ...query,
    data: query.data?.contributions ?? [],
    meta: query.data?.meta,
  };
};
