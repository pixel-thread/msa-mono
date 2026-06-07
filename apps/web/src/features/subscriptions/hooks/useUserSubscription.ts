import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { Subscription } from '../types';

export function useUserSubscription(userId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.USER(userId),
    queryFn: () => http.get<Subscription[]>(ENDPOINTS.SUBSCRIPTIONS.USER(userId)),
    enabled: !!userId,
  });

  const activePlan = data?.data?.[0];

  return {
    subscription: activePlan ?? null,
    isLoading,
    error,
    refetch,
  };
}
