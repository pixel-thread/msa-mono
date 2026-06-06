import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { Overview } from '@sharedType/overview';

/**
 * Hook for fetching dashboard overview data.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<Overview>} The query result containing dashboard data.
 */
export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_KEYS.OVERVIEW(),
    queryFn: () => http.get<Overview>('/dashboard/overview'),
    select: (data) => data.data,
    staleTime: 60_000,
  });
}
