import { useQuery } from '@tanstack/react-query';
import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { ContributionPeriod } from '../types';

export const useMyContributions = (status?: string, page?: number) => {
  const pageInitial = page || 1;
  const query = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.LIST(pageInitial, status),
    queryFn: async () =>
      http.get<ContributionPeriod[]>(
        buildUrlWithQuery(ENDPOINTS.CONTRIBUTION.MY, {
          status,
        })
      ),
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    meta: query.data?.meta,
  };
};
