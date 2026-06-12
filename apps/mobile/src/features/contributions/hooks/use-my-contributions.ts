import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import type { ContributionPeriod } from '../types';

export const useMyContributions = (status?: string) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.LIST(undefined, status),
    queryFn: async () => {
      const params = status ? { status } : undefined;
      return http.get<ContributionPeriod[]>(ENDPOINTS.CONTRIBUTION.MY, { params });
    },
  });

  return {
    ...query,
    data: query.data?.data ?? [],
    meta: query.data?.meta,
  };
};
