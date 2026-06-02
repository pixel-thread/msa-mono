import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';
import { Overview } from '@sharedType/overview';

/**
 * Hook for fetching dashboard overview data.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<Overview>} The query result containing dashboard data.
 */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => http.get<Overview>('/dashboard/overview'),
    select: (data) => data.data,
    staleTime: 60_000,
  });
}
