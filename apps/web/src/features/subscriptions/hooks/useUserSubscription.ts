import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { Subscription } from '../types';
import { ENDPOINTS } from '@repo/shared';

export function useUserSubscription(userId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-subscription', userId],
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
