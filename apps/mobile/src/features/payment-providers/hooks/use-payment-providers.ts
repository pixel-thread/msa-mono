import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { paymentProviderEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { PaymentProvider } from '../types';

export const useProviders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS(),
    queryFn: () => http.get<PaymentProvider[]>(paymentProviderEndpoints.list),
    select: (data) => data.data,
  });
};

export const useProviderDetail = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDER(id),
    queryFn: () => http.get<PaymentProvider>(paymentProviderEndpoints.detail(id)),
    select: (data) => data.data,
    enabled: !!id,
  });
};
