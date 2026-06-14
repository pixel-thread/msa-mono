import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { useAuthStore } from '../store';

export function usePaymentProviderStatus() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDER_STATUS(),
    queryFn: () => http.get<{ status: boolean }>('/payments/providers/status'),
    select: (data) => data.data,
    enabled: isAuthenticated,
  });
}
