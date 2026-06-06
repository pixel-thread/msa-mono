import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { SubscriptionPlan } from '../types';

type UsePlanProps = {
  planId: string;
};

export function usePlan({ planId }: UsePlanProps) {
  return useQuery({
    queryKey: QUERY_KEYS.SUBSCRIPTIONS_KEYS.PLAN(planId),
    queryFn: () => http.get<SubscriptionPlan>(ENDPOINTS.SUBSCRIPTIONS.PLAN_DETAILS(planId)),
    enabled: !!planId,
    select: (data) => data.data,
  });
}
