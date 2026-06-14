import { useQuery } from '@tanstack/react-query';
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
export const useMyContributions = (status?: string, page?: number) => {
  const pageInitial = page || 1;
  const { isAuthenticated } = useAuthStore();
  const query = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.LIST(pageInitial, status),
    queryFn: async () =>
      http.get<MyContributionResponse>(
        buildUrlWithQuery(ENDPOINTS.CONTRIBUTION.MY, { status, page: pageInitial })
      ),
    enabled: isAuthenticated,
  });

  return {
    ...query,
    data: query.data?.data?.contributions ?? [],
    summary: query.data?.data?.summary,
    meta: query.data?.meta,
  };
};
