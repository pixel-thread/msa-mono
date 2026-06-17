import { useInfiniteQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS, buildUrlWithQuery } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { Declaration, DeclarationStatus } from '../types';
import { useAuthStore } from '@src/shared/store';

type UseDeclarations = {
  status: 'ALL' | DeclarationStatus;
};

export const useDeclarations = ({ status }: UseDeclarations) => {
  const { isAuthenticated } = useAuthStore();

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.DECLARATIONS_KEYS.LIST(1, status),
    initialPageParam: 1,
    enabled: isAuthenticated,
    queryFn: ({ pageParam }) =>
      http.get<Declaration[]>(
        buildUrlWithQuery(ENDPOINTS.DECLARATION.LIST, { page: pageParam, status })
      ),

    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;
      return lastPage.meta.page + 1;
    },

    select: (data) => {
      const allRecords = data.pages.flatMap((page) => page.data ?? []);
      return {
        declarations: allRecords,
        meta: data.pages[data.pages.length - 1]?.meta,
      };
    },
  });
};
