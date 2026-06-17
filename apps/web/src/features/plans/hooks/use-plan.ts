import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { Plan } from '../types';

type UsePlanProps = {
  planId: string;
};

export function usePlan({ planId }: UsePlanProps) {
  return useQuery({
    queryKey: QUERY_KEYS.PLANS_KEYS.PLAN(planId),
    queryFn: () => http.get<Plan>(ENDPOINTS.PLANS.PLAN_DETAILS(planId)),
    enabled: !!planId,
    select: (data) => data.data,
  });
}
