import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import type { PlanVersion } from '@src/features/plans/types';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

export function usePlanVersions(planId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PLANS_KEYS.PLAN_VERSION(planId),
    queryFn: () => http.get<PlanVersion[]>(ENDPOINTS.PLANS.PLAN_VERSIONS(planId)),
    enabled: !!planId,
  });

  return {
    planVersions: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
