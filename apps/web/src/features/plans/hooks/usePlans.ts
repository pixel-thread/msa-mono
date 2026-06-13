import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { Plan } from '../types';

interface UsePlansOptions {
  page?: number;
}

export function usePlans(options: UsePlansOptions = {}) {
  const { page = 1 } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PLANS_KEYS.PLANS(page),
    queryFn: () =>
      http.get<Plan[]>(buildUrlWithQuery(ENDPOINTS.PLANS.PLANS, { page })),
  });

  return {
    plans: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
