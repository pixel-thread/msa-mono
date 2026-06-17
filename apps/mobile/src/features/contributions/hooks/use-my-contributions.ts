import { useInfiniteQuery } from '@tanstack/react-query';
import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { ContributionPeriod } from '../types';
import { useAuthStore } from '@src/shared/store';

type ContributionsSummary = {
  totalExpected: number;
  totalPartial: number;
  totalPaid: number;
  overdueAmount: number;
  overdueCount: number;
  pendingCount: number;
  waivedTotal: number;
};
type MyContributionResponse = {
  contributions: ContributionPeriod[];
  summary: ContributionsSummary;
};
const summeryDefault = {
  totalExpected: 0,
  totalPaid: 0,
  totalPartial: 0,
  overdueCount: 0,
  overdueAmount: 0,
  pendingCount: 0,
  waivedTotal: 0,
};

export const useMyContributions = (status?: string, page?: number) => {
  const pageInitial = page || 1;
  const { isAuthenticated } = useAuthStore();

  const query = useInfiniteQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.LIST(pageInitial, status),
    initialPageParam: 1,
    enabled: isAuthenticated,
    queryFn: async ({ pageParam }) => {
      return http.get<MyContributionResponse>(
        buildUrlWithQuery(ENDPOINTS.CONTRIBUTION.MY, { page: pageParam, status })
      );
    },

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
      const contributions = data.pages.flatMap((page) => page.data?.contributions ?? []);
      const summary = data.pages.flatMap((page) => page.data?.summary ?? summeryDefault)[0];
      return {
        contributions,
        summary,
        meta: data.pages[data.pages.length - 1]?.meta,
      };
    },
  });

  return {
    ...query,
    data: query.data?.contributions ?? [],
    summary: query.data?.summary ?? summeryDefault,
    meta: query.data?.meta,
  };
};
