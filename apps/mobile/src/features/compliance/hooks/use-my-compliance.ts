import { useInfiniteQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, QUERY_KEYS, buildUrlWithQuery } from '@repo/shared';
import { Compliance } from '../types/compliance.types';
import { useAuthStore } from '@src/shared/store';

export const useMyCompliance = () => {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.COMPLIANCE_KEYS.MY(),
    initialPageParam: 1,
    enabled: isAuthenticated,
    queryFn: ({ pageParam }) =>
      http.get<Compliance[]>(
        buildUrlWithQuery(ENDPOINTS.COMPLIANCE.MY_LIST, { page: pageParam }),
      ),

    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;
      return lastPage.meta.page + 1;
    },

    select: (data) => {
      const allRecords = data.pages.flatMap((page) => page.data ?? []);
      return {
        compliance: allRecords,
        meta: data.pages[data.pages.length - 1]?.meta,
      };
    },
  });
};
