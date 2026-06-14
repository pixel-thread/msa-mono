import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';
import { PaymentProvider } from '../types';
import { useAuthStore } from '@src/shared/store';

export const useProviders = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS(),
    queryFn: () => http.get<PaymentProvider[]>(ENDPOINTS.PAYMENTS.PROVIDERS.LIST),
    select: (data) => data.data,
    enabled: isAuthenticated,
  });
};

export const useProviderDetail = (id: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDER(id),
    queryFn: () => http.get<PaymentProvider>(ENDPOINTS.PAYMENTS.PROVIDERS.DETAIL(id)),
    select: (data) => data.data,
    enabled: !!id && isAuthenticated,
  });
};
