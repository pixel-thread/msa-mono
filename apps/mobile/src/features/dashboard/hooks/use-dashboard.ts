import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { useAuthStore } from '@src/shared/store';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import type { DashboardOverview } from '../types';

export function useDashboard() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_KEYS.OVERVIEW(),
    queryFn: async () => http.get<DashboardOverview>(ENDPOINTS.DASHBOARD.OVERVIEW),
    select: (data) => data?.data,
    enabled: isAuthenticated,
  });
}
