import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { Subscription } from '../types';
import { subscriptionEndpoints } from '../utils/constants/endpoints';

export function useUserSubscription(userId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-subscription', userId],
    queryFn: () => http.get<Subscription>(subscriptionEndpoints.userSubscription(userId)),
    enabled: !!userId,
  });

  return {
    subscription: data?.data ?? null,
    isLoading,
    error,
    refetch,
  };
}
