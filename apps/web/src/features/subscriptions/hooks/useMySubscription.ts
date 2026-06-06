import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { Subscription } from '../types';
import { subscriptionEndpoints } from '../utils/constants/endpoints';

export function useMySubscription(page: number = 1) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.MY(page),
    queryFn: () => http.get<Subscription>(subscriptionEndpoints.myList(page)),
  });

  return {
    subscription: data?.data ?? null,
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
