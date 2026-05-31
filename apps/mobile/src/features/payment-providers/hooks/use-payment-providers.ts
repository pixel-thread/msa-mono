import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { paymentProviderEndpoints, ProviderQueryKeys } from '../utils/constants';
import { PaymentProvider } from '../types';

export const useProviders = () => {
  return useQuery({
    queryKey: ProviderQueryKeys.all(),
    queryFn: () => http.get<PaymentProvider[]>(paymentProviderEndpoints.list),
    select: (data) => data.data,
  });
};

export const useProviderDetail = (id: string) => {
  return useQuery({
    queryKey: ProviderQueryKeys.detail(id),
    queryFn: () => http.get<PaymentProvider>(paymentProviderEndpoints.detail(id)),
    select: (data) => data.data,
    enabled: !!id,
  });
};
