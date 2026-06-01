import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { subscriptionEndpoints } from '../utils/constants/endpoints';
import { SubscriptionPlan } from '../types';

type UsePlanProps = {
  planId: string;
};

export function usePlan({ planId }: UsePlanProps) {
  return useQuery({
    queryKey: ['plan', planId],
    queryFn: () => http.get<SubscriptionPlan>(subscriptionEndpoints.planById(planId)),
    enabled: !!planId,
    select: (data) => data.data,
  });
}
