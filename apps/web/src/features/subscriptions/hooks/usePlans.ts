import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { SubscriptionPlan } from '../types';
import { subscriptionEndpoints } from '../utils/constants/endpoints';

interface UsePlansOptions {
  page?: number;
}

export function usePlans(options: UsePlansOptions = {}) {
  const { page = 1 } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLANS(page),
    queryFn: () => http.get<SubscriptionPlan[]>(subscriptionEndpoints.plansList(page)),
  });

  return {
    plans: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
