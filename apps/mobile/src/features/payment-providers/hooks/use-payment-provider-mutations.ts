import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { paymentProviderEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { PaymentProviderPayload, PaymentProvider } from '../types';

export const useAddProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentProviderPayload) => 
      http.post<PaymentProvider>(paymentProviderEndpoints.add, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS() });
    },
  });
};

export const useDeleteProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      http.delete(paymentProviderEndpoints.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS() });
    },
  });
};

export const useActivateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      http.post<PaymentProvider>(paymentProviderEndpoints.activate(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS() });
    },
  });
};
