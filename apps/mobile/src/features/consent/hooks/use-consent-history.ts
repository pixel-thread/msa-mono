import { useInfiniteQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS, buildUrlWithQuery } from '@repo/shared';
import { ConsentReceiptRecord } from '../types';
import http from '@src/shared/utils/http';
import { useAuthStore } from '@src/shared/store';

export const useConsentHistory = () => {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.CONSENT_KEYS.HISTORY(),
    initialPageParam: 1,
    enabled: isAuthenticated,
    queryFn: ({ pageParam }) =>
      http.get<ConsentReceiptRecord[]>(
        buildUrlWithQuery(ENDPOINTS.CONSENT.HISTORY, { page: pageParam })
      ),

    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;
      return lastPage.meta.page + 1;
    },

    select: (data) => {
      const allRecords = data.pages.flatMap((page) => page.data ?? []);
      return {
        receipts: allRecords,
        meta: data.pages[data.pages.length - 1]?.meta,
      };
    },
  });
};
