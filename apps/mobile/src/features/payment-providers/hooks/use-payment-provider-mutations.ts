import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { paymentProviderEndpoints, ProviderQueryKeys } from '../utils/constants';
import { PaymentProviderPayload, PaymentProvider } from '../types';

export const useAddProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentProviderPayload) => 
      http.post<PaymentProvider>(paymentProviderEndpoints.add, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ProviderQueryKeys.all() });
    },
  });
};

export const useDeleteProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      http.delete(paymentProviderEndpoints.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ProviderQueryKeys.all() });
    },
  });
};

export const useActivateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      http.post<PaymentProvider>(paymentProviderEndpoints.activate(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ProviderQueryKeys.all() });
    },
  });
};
