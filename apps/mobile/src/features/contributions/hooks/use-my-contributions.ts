import { useQuery } from '@tanstack/react-query';
import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { ContributionPeriod } from '../types';

type ContributionsSummary = {
  totalExpected: number;
  totalPartial: number;
  totalPaid: number;
  overdueAmount: number;
  overdueCount: number;
  pendingCount: number;
  waivedTotal: number;
};
export const useMyContributions = (status?: string, page?: number) => {
  const pageInitial = page || 1;
  const query = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.LIST(pageInitial, status),
    queryFn: async () =>
      http.get<{ summary: ContributionsSummary; contributions: ContributionPeriod[] }>(
        buildUrlWithQuery(ENDPOINTS.CONTRIBUTION.MY, {
          status,
        })
      ),
  });

  return {
    ...query,
    data: query.data?.data?.contributions ?? [],
    summary: query.data?.data?.summary,
    meta: query.data?.meta,
  };
};
