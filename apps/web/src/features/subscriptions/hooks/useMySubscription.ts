import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { Subscription } from '../types';

export function useMySubscription(page: number = 1) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.MY(page),
    queryFn: () => http.get<Subscription>(buildUrlWithQuery(ENDPOINTS.SUBSCRIPTIONS.MY, { page })),
  });

  return {
    subscription: data?.data ?? null,
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
