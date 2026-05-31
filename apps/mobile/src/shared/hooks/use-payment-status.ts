import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';

export function usePaymentProviderStatus() {
  return useQuery({
    queryKey: ['payment', 'provider', 'status'],
    queryFn: () => http.get<{ status: boolean }>('/payments/providers/status'),
    select: (data) => data.data,
  });
}
