import { useQuery } from '@tanstack/react-query';
import http from '../utils/http';
import { Overview } from '../types/overview';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => http.get<Overview>('/dashboard/overview'),
    select: (data) => data.data,
    staleTime: 60_000,
  });
}
